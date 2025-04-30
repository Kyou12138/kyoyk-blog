---
title: C#中使用缓存委托提升反射性能遇到的问题
description: C#中使用缓存委托提升反射性能遇到的问题
tags: [csharp, optimization]
---
本文介绍了在C#中使用缓存委托来提升反射性能时遇到的问题及解决方案。通过将属性的Get方法委托缓存到Map中，可以避免重复反射操作，从而显著提高性能。文章详细讲解了实现过程中遇到的类型不匹配问题，以及如何利用静态泛型方法和委托来解决这一问题。

<!--truncate-->

# C#中使用缓存委托提升反射性能遇到的问题

## 背景

开发一个通用的增量同步功能时，需要使用反射获取实体类对象的属性值，如

``` c#
Type type = typeof(T);
PropertyInfo propertyInfo = type.GetProperty(propName);
object returnValue = propertyInfo.GetValue(model);
```

但是这样每次获取值都需要进行一次反射，故使用一个**Map\<string, Func\<T, object\>\>**，将属性的Get方法委托缓存到其中

即Map中存放 **属性名 + 对应的Get方法委托**

这样只需要第一次将委托缓存到Map中，后续操作直接使用委托即可，从而提高性能，如

```c#
type = typeof(T);
propertyInfos = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);

foreach (var prop in propertyInfos)
{
    getValueMaps.Add(prop.Name, (Func<T, object>)prop.GetGetMethod().CreateDelegate(typeof(Func<T, object>)));
}
```

但是上面代码会报异常：System.ArgumentException: 'Cannot bind to the target method because its signature is not compatible with that of the delegate type.'

这是因为prop.GetGetMethod()的委托类型其实是Func\<T, TReturn\>，这样会导致类型不匹配

## 解决办法

那怎么解决呢？

主要是如何生成对应的Func\<T, TReturn\>方法

我这里**利用静态泛型方法和委托生成对应泛型方法**，见下面12到20行代码

``` csharp
public KuaiAccess()
{
    type = typeof(T);
    propertyInfos = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);

    //foreach (var prop in propertyInfos)
    //{
    //    getValueMaps.Add(prop.Name, (Func<T, object>)prop.GetGetMethod().CreateDelegate(typeof(Func<T, object>)));
    //}

    // 利用委托构建反射获取属性 利用静态泛型方法和委托生成对应泛型方法
    MethodInfo genericHelper = typeof(KuaiAccess<T>)
        .GetMethod(nameof(GenericHelper), BindingFlags.NonPublic | BindingFlags.Static);
    foreach (var prop in propertyInfos)
    {
        MethodInfo constructedHelper = genericHelper
            .MakeGenericMethod(typeof(T), prop.GetGetMethod().ReturnType);
        object ret = constructedHelper.Invoke(null, new object[] { prop.GetGetMethod() });
        getValueMaps.Add(prop.Name, (Func<T, object>)ret);
    }
}
private static Func<TTarget, object> GenericHelper<TTarget, TReturn>(MethodInfo method)
{
    // 将MethodInfo变为强类型的委托
    Func<TTarget, TReturn> func = (Func<TTarget, TReturn>)Delegate
        .CreateDelegate(typeof(Func<TTarget, TReturn>), method);
    // 创建弱类型委托 调用强类型委托
    object ret(TTarget t)
    {
        return func(t);
    }
    return ret;
}
```

