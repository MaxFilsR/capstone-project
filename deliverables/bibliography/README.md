# How to build:

1. Using TeXstudio
2. Options -> Configure TeXstudio -> Commands 
	1. Latexmk: `latexmk -pdf -silent -synctex=1 %`
	2. Biber: `biber %`
3. Options -> Configure TeXstudio -> Build
	1. Build & View: `Compile & View`
	2. Default Compiler: `txs:///latexmk | txs:///Clean`
	3. Default Viewer: `PDF Viewer`
	4. PDF Viewer: `Internal PDF Viewer (Embedded)`
	5. Default Bibliography Tool: `BibTeX`
	6. User Commands: `Clean:Clean` `latexmk -c`
