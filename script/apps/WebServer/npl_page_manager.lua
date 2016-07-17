--[[
Title: precompiled npl page
Author: LiXizhi
Date: 2015/6/9
Desc: npl server page is compiled on first use, 
all subsequent requests use precompiled version, unless file change is detected.  

-----------------------------------------------
NPL.load("(gl)script/apps/WebServer/npl_page_manager.lua");
local npl_page_manager = commonlib.gettable("WebServer.npl_page_manager");
local manager = npl_page_manager:new();
manager:monitor_directory(directory_name);
manager:get(filename);
manager:refresh(filename);
manager:clear();
-----------------------------------------------
]]
NPL.load("(gl)script/apps/WebServer/npl_page_parser.lua");
NPL.load("(gl)script/ide/FileSystemWatcher.lua");
NPL.load("(gl)script/ide/Files.lua");
local npl_page_parser = commonlib.gettable("WebServer.npl_page_parser");
local npl_http = commonlib.gettable("WebServer.npl_http");

local npl_page_manager = commonlib.inherit(nil, commonlib.gettable("WebServer.npl_page_manager"));

function npl_page_manager:ctor()
	self.pages = {};
end

-- create get a given file
-- @return page, bNewlyLoaded
function npl_page_manager:get(filename)
	local page = self.pages[filename];
	local bNewlyLoaded;
	if(not page) then
		page = npl_page_parser:new():init(self);
		page:parse(filename);
		self.pages[filename] = page;
		bNewlyLoaded = true;
	end
	return page, bNewlyLoaded;
end

-- create get a given page code
-- @param code: the actual code string to include. 
-- @param filename: nil to default to "__code". only used for displaying error
-- @return page, bNewlyLoaded
function npl_page_manager:get_by_code(code, filename)
	filename = filename or "__code";
	local page = self.pages[filename];
	local bNewlyLoaded;
	if(not page) then
		page = npl_page_parser:new():init(self);
		self.pages[filename] = page;
		page:SetFilename(filename);
		bNewlyLoaded = true;
	end
	if(page.__code ~= code) then
		page:parse_text(code);
		page.__code = code;
		bNewlyLoaded = true;
	end
	return page, bNewlyLoaded;
end

function npl_page_manager:clear()
	self.pages = {};
end

-- parse and compile again. 
function npl_page_manager:refresh(filename)
	local page = self.pages[filename];
	if(page) then
		page:parse(filename);
	end
end

-- file extension
local monitored_files = {
	["page"] = true,
	-- ["lua"] = true,
	-- ["html"] = true,
	-- ["htm"] = true,
	["npl"] = true,
}

-- @return rootdir or ""
function npl_page_manager:GetRootDirectory(dir)
	if(not commonlib.Files.IsAbsolutePath(dir)) then
		local dev = commonlib.Files.GetDevDirectory();
		if(dev == "") then
			dev = ParaIO.GetWritablePath();
		end
		return dev;
	end
	return "";
end

-- monitor file change and call refresh() automatically 
function npl_page_manager:monitor_directory(dir)
	if(dir) then
		self.watcher = self.watcher or commonlib.FileSystemWatcher:new();
		local watcher = self.watcher;
		watcher.filter = function(filename)
			local ext = filename:match("%.(%w+)$");
			if(ext) then
				return monitored_files[ext];
			end
		end
		if(not string.find(dir, "/$")) then
			dir = dir.."/";
		end
		local root = self:GetRootDirectory(dir);
		local rootSize = #root;
		watcher:AddDirectory(root..dir);
		-- also monitor other directories, such as in current world directory. 
		watcher:SetMonitorAll(true);
		watcher.OnFileChanged = function (msg)
			if(msg.type == "modified" or msg.type == "added" or msg.type=="renamed_new_name") then
				LOG.std(nil, "info", "npl_page_manager", "File %s: %s", msg.fullname, msg.type);
				self:refresh(msg.fullname:sub(rootSize+1));
			end
		end
	end
end