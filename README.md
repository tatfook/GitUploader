# GitUploader

Ggithub cloud storage of user worlds

[sketchboard](https://sketchboard.me/BzZs7yYZqOrl)

##The screenshot of the application
[gui](https://github.com/tatfook/GitUploader/blob/master/screenshot/gui.png)     
[login](https://github.com/tatfook/GitUploader/blob/master/screenshot/login.png)     
[upload](https://github.com/tatfook/GitUploader/blob/master/screenshot/upload.png)    

##Main points
###Files Finder
Recursive function to research all the files form a rootdir and lots of subdirs      
[main.lua](https://github.com/tatfook/GitUploader/blob/master/Mod/GitUploader/main.lua)

###Files sync algotirhm     
[GitUploaderController.js](https://github.com/tatfook/GitUploader/blob/master/script/apps/WebServer/admin/wp-content/pages/gituploader/controllers/GitUploaderController.js)       
1.  Get the file sha info list form github server, if success, turn to step 2, else it means selevted repos is empty, then turn to step 3  
2.  Compare the file sha info list with local ones, it has 3 situations  
(1) file name does not exist, delete it  
(2) file name exists but file sha value does not equal, update it  
(3) file name exists and file sha value equal, retain it  
3.  Aftering updating files, find files not being existed in github server form local files, upload them   

