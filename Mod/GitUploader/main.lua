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

NPL.load("(gl)script/ide/System/Encoding/base64.lua");
NPL.load("(gl)script/ide/System/Encoding/sha1.lua");
local Encoding_ = commonlib.gettable("System.Encoding");
--assert(Encoding.sha1("The quick brown fox jumps over the lazy dog", "hex") == "2fd4e1c67a2d28fced849ee1bb76e7391b93eb12");
--assert(Encoding.sha1("The quick brown fox jumps over the lazy dog", "base64") == "L9ThxnotKPzthJ7hu3bnORuT6xI=");

--NPL.load("(gl)Mod/GitUploader/Helper.lua");
local GitUploader = commonlib.inherit(commonlib.gettable("Mod.ModBase"),commonlib.gettable("Mod.GitUploader"));


local function encode_css_id(id)
	return id:gsub("/", "#");
end
local function decode_css_id(id)
	return id:gsub("#", "/");
end

--get file content by text
local function getFileContent(filePath)      
	local file = ParaIO.open(filePath, "r");
	if(file:IsValid()) then
		local fileContent = file:GetText(0, -1);
		file:close();
		return fileContent;
	end
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
	--filter = filter or "*";
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

	--local result = commonlib.Files.Find({}, path, nMaxFileLevels, nMaxFilesNum, "*.");
	local result = commonlib.Files.Find({}, path, nMaxFileLevels, nMaxFilesNum, "*");

local result = commonlib.Files.Find({}, path, nMaxFileLevels, nMaxFilesNum, filter);
    for _, item in ipairs(result) do

      if(string.find(item.filename, '/') == nil) then

	item.filename = commonlib.Encoding.DefaultToUtf8(item.filename);
	item.id = (curPath..(item.filename or ""));
	item.file_path = worldDir..item.filename;

	if(item.filesize ~= 0) then 
	--current dir is file
		
		--get file content by text
		item.file_content_t = getFileContent(item.file_path);
		--get file base64 encode
		item.file_content = Encoding_.base64(item.file_content_t);
		--get file sha1 value
		item.sha1 = Encoding_.sha1("blob "..item.filesize.."\0"..item.file_content_t, "hex");
		item.needUpload = true;
		output[#output+1] = item;
	else
	--current dir is folder, then find files in current dir.

		local subresult = commonlib.Files.Find({}, item.file_path, nMaxFileLevels, nMaxFilesNum, filter);

		for _, subitem in ipairs(subresult) do
			subitem.filename = item.filename.."/"..commonlib.Encoding.DefaultToUtf8(subitem.filename);
			subitem.id = (curPath..(subitem.filename or ""));
			subitem.file_path = worldDir.."/"..subitem.filename;
			--get file content by text
			subitem.file_content_t = getFileContent(subitem.file_path);
			--get file base64 encode
			subitem.file_content = Encoding_.base64(subitem.file_content_t);
			--get file sha1 value
			subitem.sha1 = Encoding_.sha1("blob "..subitem.filesize.."\0"..subitem.file_content_t, "hex");
			subitem.needUpload = true;
			output[#output+1] = subitem;
		end
	end

	
      
      end
    end

	return output;
end

function GitUploader:LoadFiles_(worldDir,curPath,filter,nMaxFileLevels,nMaxFilesNum)
	filter = filter or "*.*";
	nMaxFileLevels = nMaxFileLevels or 0;
	nMaxFilesNum = nMaxFilesNum or 500;
	local output = {};
	local path = worldDir..curPath;
	if(curPath ~= "") then
		curPath = curPath.."/";
	end

	NPL.load("(gl)script/ide/Files.lua");
	
	

	local function filesFind(result)
		if(type(result) == "table") then
			for i = 1, #result do
				local item = result[i];
				if(not string.match(item.filename, '/')) then
					if(item.filesize ~= 0) then
						--path = string.gsub(path, 'MyWorld/', 'MyWorld', 1);
						item.file_path = path..'/'..item.filename;
						--string.gsub(path..item.filename, '//', '/', 1);
						item.filename = commonlib.Encoding.DefaultToUtf8(string.gsub(item.file_path, 'worlds/DesignHouse/MyWorld//', '', 1));
						item.id = item.filename;
						item.file_content_t = getFileContent(item.file_path);
						item.file_content = Encoding_.base64(item.file_content_t);
						item.sha1 = Encoding_.sha1("blob "..item.filesize.."\0"..item.file_content_t, "hex");
						item.needUpload = true;
						output[#output+1] = item;
					else
						path = path ..'/'.. item.filename;
						local result = commonlib.Files.Find({}, path, 0, nMaxFilesNum, filter);
						filesFind(result);
						path = string.gsub(path, ('/'..item.filename), '', 1);
					end
				end
			end
		end
	end

	local result = commonlib.Files.Find({}, path, 0, nMaxFilesNum, filter);
	filesFind(result);
	
	return output;
end


