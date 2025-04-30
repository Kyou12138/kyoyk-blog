---
title: EFCore笔记
description: EFCore笔记
tags: [csharp, optimization]
---

本文记录了使用Entity Framework Core时的一些优化技巧和常见问题解决方案。

<!--truncate-->

# 优化 - AsSplitQuery

什么时候使用：

当使用了多个include时，可以考虑使用

原理：

将联表查询转换为多个查询，并在EFCore内部合并，使用内存合并速度，减少大数据流量（笛卡尔积爆炸造成的）在网络传输消耗的时间。

# Sqlite读取连接字符串


Try using a Configuration Builder class to build the configuration and the use that configuration to get the Connection String and then also remove the line `builder.Configuration.Sources.Clear()` as it could be clearing the connection string from your configuration file.

```c#
//build your configuration like this
var cfg = new ConfigurationBuilder()
         .SetBasePath(builder.Environment.ContentRootPath)
.AddJsonFile("appsettings.json",optional: false,reloadOnChange: true)
.AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json",optional: true)
.AddEnvironmentVariables()
.Build();
//then use the configuration to use sqlite 
options.UseSqlite(cfg.GetConnectionString("DefaultConnection"));
```

