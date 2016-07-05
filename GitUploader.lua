--[[
author: LiZhiqiang
date: 2016/07/04
desc: defined GitUploader class
usage:
--------------------------
NPL.load("(gl)scritp/ide/GitUploader.lua");
local arraySort = commonlib.gettable("GitUploader");
--------------------------
--]]

local GitUploader = commonlib.gettable("GitUploader");

local localSrc = {};
local uploadServer = {"http://github.com"};
local userName = {};
local password = {};


function GitUploader.checkHasAccount(tag)
	return tag;
end

function GitUploader.getSignupPage()
	return "https://github.com/join?source=header-home";
end

function GitUploader.getLoginPage()
	return "https://github.com/login?return_to=%2Fjoin%3Fsource%3Dheader-home";
end

function GitUploader.getUserName(name)
	userName = name;
end

function GitUploader.getPassword(pwd)
	password = pwd;
end

function GitUploader.checkAccount(checked)
	return checked;
end

function GitUploader.getLocalSrc(fileName)
	localSrc = fileName;
end

function GitUploader.uploadedSrcDesc(desc)
	return desc;
end

function GitUploader.uploadSrc(fileName)
	print("--uploading--")
end

function GitUploader.checkUpload(tag)
	return rag;
end
