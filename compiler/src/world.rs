use std::{ borrow::Borrow, collections::HashMap, path::{ Path, PathBuf }, sync::OnceLock };

use chrono::{ DateTime, Datelike, Local };
use parking_lot::Mutex;
use send_wrapper::SendWrapper;
use typst::{
    diag::{ EcoString, FileError, FileResult, PackageError, PackageResult },
    foundations::{ Bytes, Datetime },
    layout::PagedDocument,
    syntax::{ package::PackageSpec, FileId, Source, VirtualPath },
    text::{ Font, FontBook },
    utils::LazyHash,
    Library,
    LibraryExt,
    World,
};
use wasm_bindgen::JsValue;

use crate::{ diagnostic::format_diagnostic, file_entry::FileEntry };

pub struct SystemWorld {
    root: PathBuf,
    main: FileId,
    library: LazyHash<Library>,
    book: LazyHash<FontBook>,
    fonts: Vec<Font>,
    files: Mutex<HashMap<FileId, FileEntry>>,
    now: OnceLock<DateTime<Local>>,
    packages: Mutex<HashMap<PackageSpec, PackageResult<PathBuf>>>,
    request_data: SendWrapper<js_sys::Function>,
}

impl SystemWorld {
    pub fn new(root: String, request_data: &js_sys::Function) -> SystemWorld {
        let (book, fonts) = SystemWorld::start_embedded_fonts();

        Self {
            root: PathBuf::from(root),
            main: FileId::new(None, VirtualPath::new("")),
            library: LazyHash::new(Library::default()),
            book: LazyHash::new(book),
            fonts,
            files: Mutex::default(),
            now: OnceLock::new(),
            packages: Mutex::default(),
            request_data: SendWrapper::new(request_data.clone()),
        }
    }

    pub fn compile(&mut self, text: String, path: String) -> Result<PagedDocument, JsValue> {
        self.reset();

        self.main = FileId::new(None, VirtualPath::new(path));
        self.files.get_mut().insert(self.main, FileEntry::new(self.main, text));
        typst
            ::compile(self)
            .output.map_err(|errors|
                format_diagnostic(self.files.get_mut().borrow(), &errors).into()
            )
    }

    pub fn add_font(&mut self, data: Vec<u8>) {
        let buffer = Bytes::new(data);
        let mut font_infos = Vec::new();
        for font in Font::iter(buffer) {
            font_infos.push(font.info().clone());
            self.fonts.push(font);
        }
        if font_infos.len() > 0 {
            for info in font_infos {
                self.book.push(info);
            }
        }
    }

    pub fn reset_fonts(&mut self) {
        let (book, fonts) = SystemWorld::start_embedded_fonts();
        self.book = LazyHash::new(book);
        self.fonts = fonts;
    }

    fn reset(&mut self) {
        self.packages.get_mut().clear();
        self.now.take();
    }

    fn request_data(&self, param1: String) -> Result<JsValue, JsValue> {
        return self.request_data.call1(&JsValue::NULL, &param1.into());
    }

    fn read_file(&self, path: &Path) -> FileResult<String> {
        let f = |e: JsValue| {
            if let Some(value) = e.as_f64() {
                return match value as i64 {
                    2 => FileError::NotFound(path.to_path_buf()),
                    3 => FileError::AccessDenied,
                    4 => FileError::IsDirectory,
                    _ => FileError::Other(Some(EcoString::from("see console for details"))),
                };
            }
            FileError::Other(e.as_string().map(EcoString::from))
        };

        let result = self.request_data(path.to_str().unwrap().to_owned()).map_err(f)?;
        Ok(result.as_string().unwrap())
    }

    fn read_file_binary(&self, path: &Path) -> FileResult<Vec<u8>> {
        let f = |e: JsValue| {
            if let Some(value) = e.as_f64() {
                return match value as i64 {
                    2 => FileError::NotFound(path.to_path_buf()),
                    3 => FileError::AccessDenied,
                    4 => FileError::IsDirectory,
                    _ => FileError::Other(Some(EcoString::from("see console for details"))),
                };
            }
            FileError::Other(e.as_string().map(EcoString::from))
        };

        let binary_path = format!("{}:binary", path.to_str().unwrap());
        let result = self.request_data(binary_path).map_err(f)?;
        let uint8_array = js_sys::Uint8Array::from(result);
        let bytes = uint8_array.to_vec();

        Ok(bytes)
    }

    fn is_binary_file(path: &Path) -> bool {
        if let Some(ext) = path.extension() {
            let ext_lower = ext.to_string_lossy().to_lowercase();
            matches!(
                ext_lower.as_str(),
                "jpg" |
                    "jpeg" |
                    "png" |
                    "gif" |
                    "bmp" |
                    "webp" |
                    "svg" |
                    "pdf" |
                    "zip" |
                    "wasm" |
                    "ttf" |
                    "otf" |
                    "woff" |
                    "woff2"
            )
        } else {
            false
        }
    }

    fn prepare_package(&self, spec: &PackageSpec) -> PackageResult<PathBuf> {
        let f = |e: JsValue| {
            if let Some(num) = e.as_f64() {
                return match num as i64 {
                    2 => PackageError::NotFound(spec.clone()),
                    _ => PackageError::Other(Some(EcoString::from("see console for details"))),
                };
            }
            PackageError::Other(e.as_string().map(EcoString::from))
        };
        self.packages
            .lock()
            .entry(spec.clone())
            .or_insert_with(|| {
                Ok(
                    self
                        .request_data(format!("@{}/{}/{}", spec.namespace, spec.name, spec.version))
                        .map_err(f)?
                        .as_string()
                        .unwrap()
                        .into()
                )
            })
            .clone()
    }

    fn file_entry<F, T>(&self, id: FileId, f: F) -> FileResult<T>
        where F: FnOnce(&mut FileEntry) -> T
    {
        let mut map = self.files.lock();
        if !map.contains_key(&id) {
            let path = match id.package() {
                Some(spec) => self.prepare_package(spec)?,
                None => self.root.clone(),
            };

            let resolved_path = id.vpath().resolve(&path).ok_or(FileError::AccessDenied)?;

            let entry = if SystemWorld::is_binary_file(&resolved_path) {
                let data = self.read_file_binary(&resolved_path)?;
                FileEntry::new_binary(id, data)
            } else {
                let text = self.read_file(&resolved_path)?;
                FileEntry::new(id, text)
            };

            map.insert(id, entry);
        }
        Ok(f(map.get_mut(&id).unwrap()))
    }

    fn start_embedded_fonts() -> (FontBook, Vec<Font>) {
        let mut book = FontBook::new();
        let mut fonts = Vec::new();

        for data in typst_assets::fonts() {
            let buffer = Bytes::new(data);
            for font in Font::iter(buffer) {
                book.push(font.info().clone());
                fonts.push(font);
            }
        }

        return (book, fonts);
    }
}

impl World for SystemWorld {
    fn library(&self) -> &LazyHash<Library> {
        &self.library
    }

    fn book(&self) -> &LazyHash<FontBook> {
        &self.book
    }

    fn main(&self) -> FileId {
        self.main
    }

    fn source(&self, id: FileId) -> FileResult<Source> {
        self.file_entry(id, |f| f.source())
    }

    fn file(&self, id: FileId) -> FileResult<Bytes> {
        self.file_entry(id, |f| f.bytes())
    }

    fn font(&self, index: usize) -> Option<Font> {
        Some(self.fonts[index].clone())
    }

    fn today(&self, offset: Option<i64>) -> Option<Datetime> {
        let now = self.now.get_or_init(chrono::Local::now);

        let naive = match offset {
            None => now.naive_local(),
            Some(o) => now.naive_utc() + chrono::Duration::hours(o),
        };

        Datetime::from_ymd(
            naive.year(),
            naive.month().try_into().ok()?,
            naive.day().try_into().ok()?
        )
    }
}
