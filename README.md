# REED
Chill epub reader with library management
#### Built with [ [electron](https://github.com/electron/electron) ] | [ [epub.js](https://github.com/futurepress/epub.js/) ] and [ [react-reader](https://github.com/gerhardsletten/react-reader) ]

<br/>
<p align="center" ><img src="https://cdn.discordapp.com/attachments/673801616754999297/792944069315395584/EvolvedMesh_LOGO_Transparent_dark_mode.png" alt="Logo" width="120" height="120"></p>  
<br/>



## Installation
Windows installer -> https://github.com/61soldiers/reed/releases/download/v1.0.1/Reed.Setup.1.0.1.exe
<br/>
or

```
git clone https://github.com/61soldiers/reed.git
```

### Installing packages
```
npm install
```

### 3rd Party dependencies
To use the pdf to epub conversion feature, you will need [calibre](https://calibre-ebook.com/download). 
Download and install, no other actions needed.

## Running in developer mode
```
npm run dev
```

## Building and packaging for windows
```
npm run dist
```
Will output an [**out**] folder in the project directory containing the unpacked files and setup

<br/>
<br/>
<img src="https://cdn.discordapp.com/attachments/673957926225838121/798001938321899560/unknown.png">

# Change log
All features, changes and fixes will be documented here
<br/>

## [1.0.1] - 2021-01-11

### Fixes
- Installer is now one-click and will be installed local to the user. In the previous release users were able to choose between a local installation or a system wide installation. System wide installation causes the app to not save changes
- If data files were erased, loading a book crashes app

## [1.0.0] - 2021-01-11

### New
- Ability to fix file path to book. Books will also show an error if path to said book file is incorrect
- Ability to search for books
- Ability to convert pdf to epub
- Ability to change font size
- Ability to change font color

### Fixes
- Opening a book the first time doesn't load said book
- 'Currently reading' had unhandled error if book doesn't exist
