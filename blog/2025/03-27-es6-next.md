---
title: ES6+ 特性
description: ES6+ 特性
slug: es6-next
tags: [front-end, javascript]
---
本文详细介绍了ES6之后JavaScript的重要更新和新特性。从ES6（ECMAScript 2015）开始，JavaScript语言进入了快速发展期，引入了箭头函数、解构赋值、Promise等革命性特性。文章梳理了从ES7到最新版本的主要变化，帮助前端开发者了解现代JavaScript的强大功能和语法糖，提高开发效率。

<!--truncate-->
# ES6+

> - ECMAScript2015：也被称之为 ES6，于 2015 年 6 月发布。[详细笔记](../2019/04-01-es6.md)
> - ECMAScript2016：也被称之为 ES7，于 2016 年 6 月发布。[详细笔记](../2019/12-25-es7.md)
> - ECMAScript2017：也被称之为 ES8，于 2017 年 6 月发布。[详细笔记](../2019/12-28-es8.md)
> - ECMAScript2018：也被称之为 ES9，于 2018 年 6 月发布。[详细笔记](../2020/08-01-es9.md)
> - ECMAScript2019：也被称之为 ES10，于 2019 年 6 月发布。[详细笔记](../2021/07-27-es10.md)
> - ECMAScript2020：也被称之为 ES11，于 2020 年 6 月发布。[详细笔记](../2021/08-25-es11.md)
> - ECMAScript2021：也被称之为 ES12，于 2021 年 6 月发布。[详细笔记](../2023/05-05-es12.md)
> - ECMAScript2022：也被称之为 ES13，于 2022 年 6 月发布。[详细笔记](../2023/08-08-es13.md)
> - ECMAScript2023：也被称之为 ES14，于 2023 年 6 月发布。[详细笔记](../2024/04-06-es14.md)
> - ECMAScript2024：也被称之为 ES15，于 2024 年 6 月发布。[详细笔记](../2024/12-27-es15.md)

## 本章导读

**简短历史回顾**

1995年，网景公司一位叫做 Brendan Eich 的工程师，为即将发布的 Netscape Navigator2 开发了一个叫做 Mocha（后来改名为 LiveScript） 的脚本语言，当时的计划是在客户端和服务端都使用它，在服务端的名字叫做 LiveWire.

后来为了赶上发布时间，网景与 Sun 公司结成开发联盟，共同完成了 LiveScript 的开发。就在 Netscape Navigator2 正式发布之前，网景把 LiveScript 改名为了 JavaScript，为的是蹭一下 Java 热度。

JavaScript1.0 非常成功，网景公司又在 Netscape Navigator3 中发布了 JavaScript1.1 版本，并且稳居浏览器领导者地位。

这时候，微软坐不住了，打算向 IE 投入更多资源。微软在 Netscape Navigator3 推出后不久，就推出了 IE3，并且包含了 JScript. 之所以叫这个名字，是为了防止和网景公司发生许可纠纷。

此时，意味着出现了两个版本的 JavaScript：

- Netscape Navigator 中的 JavaScript
- IE 中的 JScript

两个版本的 JavaScript 虽然功能上面大差不差，但是有各种细节上面的不同行为，这对于开发者来讲简直是灾难，因为这往往意味着你网页的脚本在一个浏览器中行为正常，但是在另外一个浏览器中不正常。这个问题的根本原因其实是因为当时的 JavaScript 不像 C 语言或者其他编程语言一样，有一份清晰的规范。

1997年，JavaScript1.1作为提案被提交给了欧洲计算机制造协会（Ecma），其中的第 39 技术委员会（TC39）负责来为这门语言制定标准，TC39 委员会的成员有网景、Sun、微软等，他们花了数月时间推出了 ECMA-262，也就是 ECMAScript. 1998年，国际标准化组织（ISO）和国际电工委员会（IEC）也将 ECMAScript 采纳为标准（ISO/IEC-16262）

自此，各个浏览器均已 ECMAScript 作为自家 JavaScript 引擎的实现依据，内部实现可能不同，但是行为上一定和规范所定义的标准是相同的。

**ECMAScript**

首先需要说明，ECMAScript 仅仅是一个规范，这个规范甚至没有输入和输出之类的方法。该规范主要定义了：

- 语法
- 类型
- 语句
- 关键字
- 保留字
- 操作符
- 全局对象

ECMAScript 只是对实现了该规范所有方面的一门语言的称呼。JavaScript 实现了 ECMAScript，Adobe 的 ActionScript 同样也实现了 ECMAScript.

下面简单说一下 ECMAScript 版本的发展历程：

- ECMAScript1：本质上与网景的 JavaScript1.1 相同，只不过删除了所有浏览器特定的代码，外加少量细微的修改。
- ECMAScript2：只是做了一些编校工作，目的是为了符合 ISO/IEC-16262 的要求，并没有增加和改变任何特性。
- ECMAScript3：这是第一次真正对标准进行更新，更新了字符串处理、错误定义和数值输出。此外还增加了对正则表达式、新的控制语句、try/catch 异常处理的支持。此版本的更新让 ES 看上去更像是一门真正的编程语言
- ECMAScript4: 这一版是对这门语言的彻底修订，为了满足全球 Web 开发者日益增长的需求，TC39 再次被召集起来，制定新版本的规范。结果，他们制定出来的规范几乎在第 3 版的基础上完全定义了一门新的语言，包括类型变量、新语句和数据结构、真正的类和经典的继承。此时内部出现了分歧，有的人认为这样太过于激进，有的人认为这就是这门语言的未来。最终，ECMAScript4 一直没有推出。
- ECMAScript3.1: 之后，TC39 委员会的一个子委员会，提出了另外一份提案，被称之为 ECMAScript3.1，相比 ECMAScript4，ECMAScript3.1 来得更加温和，虽然也有一些改动，但是改动较小，只要在现有的 JavaScript 引擎基础上做一些增改就可以实现。最终，ECMAScript3.1赢得了 TC39 委员会的支持，ECMAScript4 在正式发布之前被废弃。
- ECMAScript5 ：ECMAScript3.1 成为了 ECMAScript5，于 2009 年 12 月 3 日正式发布。该版本主要解决第 3 版存在歧义的地方，也增加了新的功能。例如原生的解析和序列化 JSON 数据、严格模式等。另外第 5 版在 2011 年 6 月还发布了一个维护性的修订版。
- ECMAScript6 ：俗称 ES6 或者 ES Harmony（和协版），于 2015 年 6 月发布。这个版本其实就是之前 ECMAScript4 所遗留的精神产物，涵盖了这个规范有史以来最多、也重要的一批增强特性，例如正式支持类、模块、迭代器、生成器、箭头函数、promise、反射、代理和新的数据类型。另外，从这个版本开始，ECMAScript 也变成了一年更新一次，以年号来命名。因此 ES6 也被称之为 ES2015.
- ECMAScript2016：也被称之为 ES7，于 2016 年 6 月发布。
- ECMAScript2017：也被称之为 ES8，于 2017 年 6 月发布。
- ECMAScript2018：也被称之为 ES9，于 2018 年 6 月发布。
- ECMAScript2019：也被称之为 ES10，于 2019 年 6 月发布。
- ECMAScript2020：也被称之为 ES11，于 2020 年 6 月发布。
- ECMAScript2021：也被称之为 ES12，于 2021 年 6 月发布。
- ECMAScript2022：也被称之为 ES13，于 2022 年 6 月发布。
- ECMAScript2023：也被称之为 ES14，于 2023 年 6 月发布。
- ECMAScript2024：也被称之为 ES15，于 2024 年 6 月发布。

---
