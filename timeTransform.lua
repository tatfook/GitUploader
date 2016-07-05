--[[
author: LiZhiqiang
date: 2016/07/04
desc: time format transform £¨example£º4000 s --> 1 h 6 m 40 s£©
usage:
----------------------------------------------------------
NPL.load("(gl)scritp/ide/System/Algorithm/timeTransform.lua");
local timeTransfrom = commonlib.gettable("System/Algorithm/timeTransform.lua");
timeTransform.trans(secs);
----------------------------------------------------------
--]]

local timeTransfrom = commonlib.gettable("System/Algorithm/timeTransform.lua");

local function timeTransfrom.string_split(str, exp)
    local result = {};
    local strlen = #str;
    local index = 1;
    while index < strlen do
        local start, end = string.find(str, exp, index);
        if start == nil then
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
 
local function timeTransfrom.format_time(secs, format)
    local format = string_split(format, ":")
    local radix = {24, 60, 60};
    local time_str = "";
    local base_value, base_name, value;
    local i = #radix;
    while i > 0 do
        base_value = radix[i];
        base_name = format[i + 1];
         
        value = secs % base_value;
         
        if value > 0 then
            if base_name then
                time_str = value .. base_name .. time_str;
            end
        end
         
        secs = math.floor(secs / base_value);
         
        i = i - 1;
    end
     
    if secs > 0 then
        time_str = secs .. format[i + 1] .. time_str;
    end
     
    return time_str;
end
 
function timeTransform.trans(secs) 
    print(format_time(secs, "day:hour:minute:second"));
end
