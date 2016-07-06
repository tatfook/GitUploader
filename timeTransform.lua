--[[
author: LiZhiqiang
date: 2016/07/04
desc: time format transform £¨example£º4000 s --> 1 h 6 m 40 s£©
usage:
----------------------------------------------------------
NPL.load("(gl)script/ide/System/Algorithm/timeTransform.lua");
local timeTransfrom = commonlib.gettable("System.Algorithm.timeTransform");
timeTransform.trans(secs);
----------------------------------------------------------
--]]
local string_find = string.find;
local timeTransfrom = commonlib.gettable("System.Algorithm.timeTransform");

function timeTransfrom.string_split(str, exp)
    local result = {};
    local strlen = #str;
    local index = 1;
    while index < strlen do
        local start, end = string_find(str, exp, index);
        if (not start) then
            break;
        else
            local match_str = string.sub(str, index, start - 1);
            result[#result + 1] = match_str;
            index = end + 1;
        end
    end

    --the next line code is easy to ignore.
    result[#result + 1] = string.sub(str, index);
     
    return result;
end
local string_split = timeTransfrom.string_split;

local s_radix = {24, 60, 60};

-- @param sFormat: string
function timeTransfrom.format_time(nSecs, sFormat)
    local arrayFormat = string_split(sFormat, ":")
    local time_str = ""; 
    local base_value, base_name, value;
    local i = #s_radix;
    while i > 0 do
        base_value = s_radix[i];
        base_name = arrayFormat[i + 1];
         
        value = nSecs % base_value;
         
        if value > 0 then
            if base_name then
                time_str = value .. base_name .. time_str;
            end
        end
         
        nSecs = math.floor(nSecs / base_value);
         
        i = i - 1;
    end
     
    if secs > 0 then
        time_str = secs .. arrayFormat[i + 1] .. time_str;
    end
     
    return time_str;
end
 
function timeTransform.trans(secs) 
    log(format_time(secs, "day:hour:minute:second"));
end

-- @param text: the text to print.
-- @param formatter: nil or function(text)  end, which returns the formated text. 
local function PrintMe(text, formatter)
    log(formatter and formatter(text) or text);
end


-- dynamic scoping(C,c++java, C#, ) <  static scoping (lua, js, python)

-- closures
local function test_print()
    PrintMe("abc");
    local i = 0;
    local function f(text)
        i = i + 1;
        return string.upper(text or "") .. " " ..tostring(i);
    end;
    for k=1, 3 do
        commonlib.TimerManager.SetTimeout(function()
            PrintMe("abc", f);
        end, 1000);
    end
    log("starting....\n");
end
test_print();
-->abc
-->starting...
-->ABC 1 -->ABC 2 -->ABC 3
