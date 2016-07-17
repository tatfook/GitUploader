--[[
Title: 
Author(s):  
Date: 
Desc: 
use the lib:
------------------------------------------------------------
NPL.load("(gl)Mod/GitUploader/Helper.lua");
local GitUploader = commonlib.inherit(commonlib.gettable("Mod.ModBase"),commonlib.gettable("Mod.GitUploader"));
------------------------------------------------------------
]]

--NPL.load("(gl)Mod/GitUploader/Helper.lua");
local GitUploader = commonlib.inherit(commonlib.gettable("Mod.ModBase"),commonlib.gettable("Mod.GitUploader"));


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
    _guihelper.MessageBox("hello world!!!!");
end

-- called when a world is unloaded. 
function GitUploader:OnLeaveWorld()
end

function GitUploader:OnDestroy()
end



