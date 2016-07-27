--[[
Title: 
Author(s):  
Date: 
Desc: 
use the lib:
------------------------------------------------------------
NPL.load("(gl)Mod/GitUploader/main.lua");
local GitUploader = commonlib.gettable("Mod.GitUploader");
------------------------------------------------------------
]]
NPL.load("(gl)script/ide/Encoding.lua");
local Encoding = commonlib.gettable("commonlib.Encoding");

--NPL.load("(gl)Mod/GitUploader/Helper.lua");
local GitUploader = commonlib.inherit(commonlib.gettable("Mod.ModBase"),commonlib.gettable("Mod.GitUploader"));

local function encode_css_id(id)
	return id:gsub("/", "#");
end
local function decode_css_id(id)
	return id:gsub("#", "/");
end

function GitUploader:ctor()
	
end

-- virtual function get mod name
function GitUploader:GetName()
	return "GitUploader"
end

-- virtual function get mod description 

function GitUploader:GetDesc()
	return "GitUploader is a plugin in paracraft"
end

function GitUploader:init()
	LOG.std(nil, "info", "GitUploader", "plugin initialized");
end

function GitUploader:OnLogin()
end
-- called when a new world is loaded. 

function GitUploader:OnWorldLoad() 
    --_guihelper.MessageBox("hello world!!!!");
end

-- called when a world is unloaded. 
function GitUploader:OnLeaveWorld()
end

function GitUploader:OnDestroy()
end
function GitUploader:LoadFiles(worldDir,curPath,filter,nMaxFileLevels,nMaxFilesNum)
	filter = filter or "*.*";
	nMaxFileLevels = nMaxFileLevels or 0;
	nMaxFilesNum = nMaxFilesNum or 500;
	local output = {}
	curPath = decode_css_id(commonlib.Encoding.Utf8ToDefault(curPath));
    local path = worldDir..curPath;
    if(curPath ~= "") then
      curPath = curPath.."/"
    end
	curPath = commonlib.Encoding.DefaultToUtf8(curPath);
    NPL.load("(gl)script/ide/Files.lua");

	local result = commonlib.Files.Find({}, path, nMaxFileLevels, nMaxFilesNum, "*.");
    for _, item in ipairs(result) do
      if(item.filesize == 0) then
        item.state = "closed"; -- this is a folder
		item.filename = commonlib.Encoding.DefaultToUtf8(item.filename);
        item.id = encode_css_id(curPath..(item.filename or ""));
        output[#output+1] = item;
      end
    end
	local result = commonlib.Files.Find({}, path, nMaxFileLevels, nMaxFilesNum, filter);
    for _, item in ipairs(result) do
      if(item.filesize ~= 0) then
		item.filename = commonlib.Encoding.DefaultToUtf8(item.filename);
        item.id = encode_css_id(curPath..(item.filename or ""));
		output[#output+1] = item;
      end
    end
	return output;
end



