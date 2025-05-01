---
title: Python爬虫流程
description: Python爬虫流程
tags: [python, back-end]
---
本文介绍Python爬虫的基本流程，以爬取哔哩哔哩(B站)番剧信息为例，展示如何使用requests和BeautifulSoup等库进行网页数据抓取。通过分析网页结构、提取媒体ID和相关信息，实现完整的爬虫功能。

<!--truncate-->

## 爬虫流程 ##

  1. 爬取链接
  2. 通过链接爬取内容

----------

（以爬取b站番剧信息为例，利用requests和bs4等库。）
1.**爬取链接**
由于每部番都有相应的media_id，简称md。所以只需爬取md后加到链接 https://www.bilibili.com/bangumi/media/md 的后面
即可获得番剧对应的链接。
例如：[https://www.bilibili.com/bangumi/media/md102392](https://www.bilibili.com/bangumi/media/md102392)
具体：

 - 通过浏览器的开发者工具（按F12弹出）分析Network中的数据，**一般点xhr进行筛选**：可以发现其中有一条json格式的数据，包含media_id。即：[例子](https://bangumi.bilibili.com/media/web_api/search/result?season_version=-1&area=-1&is_finish=-1&copyright=-1&season_status=-1&season_month=-1&pub_date=-1&style_id=-1&order=3&st=1&sort=0&page=1&season_type=1&pagesize=20)
   并且发现链接中的page=1代表第一页,所以只需修改此参数便可以遍历所有页数。
 - json格式的数据可以通过json包处理：通过requests.get()获取到数据后用json.loads()读取到字典类型的数据，并把字典中想要的数据如media_id保存。
   **ps**: 更好地观察json格式数据的结构可以用[here](http://www.bejson.com/jsonviewernew/)，方便提取。
   代码：

```python
# page为页数，link为每一页的链接
    link = 'https://bangumi.bilibili.com/media/web_api/search/result?season_version=-1&area=-1&is_finish=-1&copyright=-1&season_status=-1&season_month=-1&pub_date=-1&style_id=-1&order=3&st=1&sort=0&page=1&season_type=1&pagesize=20'
    link = link.replace('&page=1', '&page={}'.format(page))
```

```python
ua = UserAgent() # 利用fake_useragent库构造伪头部
headers = {'User-Agent': ua.random}
res = requests.get(url=link, headers=headers, verify=True) # verify检查SSL证书
ht = html.unescape(res.text)
result = json.loads(ht)['result']　# 读取json数据
datas = result['data']
media_id = data['media_id']# 得到media_id
# 之后保存md
```

2.**通过链接爬取内容**
上面已经获得了所有番剧的链接，之后的主要思路就是利用requests库获取网页源代码，利用bs4从网页源代码提取有用的信息。（要注意这里**只能抓取静态页面**，动态页面可以利用**selenium**，可以百度‘selenium+爬虫’，参考[here](https://blog.csdn.net/qq_36962569/article/details/77200118)。）
**ps:** 关于bs4的学习可以参考[here](https://cuiqingcai.com/1319.html)。

爬取代码的框架：

```python
# 一般是传入链接，这里传入上文爬取的media_id，标题（name）和封面链接(img_src)都不是必要的。
def crawl(name, media_id, img_src):
    link1 = link.replace('md_target', 'md' + media_id)
	ua = UserAgent()
	
	#这里预先定义好要存储的变量（可变)
====================================================================
	title = ''  # 标题
	tags = []  # 标签
====================================================================
	# 进入循环，只有爬取并保存成功才会跳出循环，异常和失败都会继续循环（固定）
    while True:
        try: 
            headers = {'User-Agent': ua.random}
            res = requests.get(url=link1, headers=headers, verify=True)
            # 状态码
            status = res.status_code
            # 当返回的状态码为200时才进行提取工作
            if status == 200:
				# 读取网页源代码（固定）
                ht = html.unescape(res.text)
                soup = BeautifulSoup(ht, 'lxml')	
                	
				# 利用bs4从网页源代码提取信息（可变）
====================================================================
				div = soup.find('div', class_='media-info-inner clearfix')
                div_info = div.find('div', class_='media-info-r')
                if div_info:
                    div_t = div_info.find('div', class_='media-info-title')  # 标题与标签
                    if div_t:
                        span_title = div_t.find('span', class_='media-info-title-t')  # 标题
                        if span_title:
                            title = span_title.get_text().strip()
                            # print(title)
                        span_tags = div_t.find_all('span', class_='media-tag')  # 标签
                        for span_tag in span_tags:
                            tags.append(span_tag.get_text().strip())
                        tags_str = ','.join(tags)
                        # print(tags_str)
====================================================================
                # 爬取成功后的操作，time.sleep防止访问过于频繁（固定）
                insert('media_id': media_id, 'title': title, 'tags': tags_str)# 插入数据库
                print('{}页面爬取成功'.format(link1))
                time.sleep(random.random())
                break # 爬取成功则跳出
            '''
            爬取失败后的操作，由于番剧可能会下架，爬取下来的media_id可能并不能对应到一个番剧，并且没有对应番剧会返回404页面，所增加了针对404情况的处理。（固定）
            '''
            elif status == 404:
                print('{}可能由于下架，状态码为{}，{}页面爬取失败，跳过。。'.format(name, status, link1))
                with open('./最近下架.log', mode='a', encoding='utf-8') as fw:
                    fw.write(name + '\t' + media_id + '\t' + img_src + '\n')
                break
            else:
                print('状态码为{}，{}页面爬取失败，重试。。'.format(status, link1))
                time.sleep(random.random())
        except Exception as e:
            print(e)
            print('{}页面爬取异常重试。。'.format(link1))
            time.sleep(random.random())
```

可通用的插入数据库方法（[关于mysql的参考](https://cuiqingcai.com/5578.html)）。

```python
# 传入字典类型，key对应字段名，value对应字段的值，需在全局定义表（table）和数据库的连接(db)
def insert(data):
    global table
    global db
    cursor = db.cursor()
    keys = ','.join(data.keys())
    values = ','.join(['%s'] * len(data))
    sql = 'INSERT IGNORE INTO {table} ({keys}) VALUES ({values})'.format(table=table, keys=keys, values=values)
    try:
        if cursor.execute(sql, tuple(data.values())):
            print('插入数据成功')
            db.commit()
    except Exception as e:
        print(e)
        print('插入数据失败')
        db.rollback()
        # 记录插入失败的条目
        with open('./insert_error.log', mode='a', encoding='utf-8') as fw:
            fw.write(data['title'] + '\t' + data['media_id'] + '\t' + data['cover'] + '\n')
    finally:
        cursor.close()
```

多进程的代码框架（python由于GIL的存在，多线程其实是鸡肋，其实我自己也不太懂，参考[多线程](https://cuiqingcai.com/3325.html)，[多进程](https://cuiqingcai.com/3335.html)）：

```python
if __name__ == '__main__':
    pool = Pool(processes=20)# 进程数为20
    # 读取链接，进行遍历 （固定）
    with open('./bilibili_media_id.txt', mode='r', encoding='utf-8') as fr:
        line = fr.readline()
        while line:
        
		    #获取参数，并传入参数（可变）
====================================================================
            temp = line.strip().split('\t')
            name = temp[0]
            media_id = temp[1]
            img_src = temp[2]
	        pool.apply_async(func=crawl, args=(name, media_id, img_src,)) # 非阻塞
====================================================================
            line = fr.readline()
    print('多进程开始。。')
    pool.close() # 进程池关闭
    pool.join()  # 等待子进程结束，主进程才结束
    db.close()
    print('主进程结束')
```

**还在学习阶段，有错误和可以改进的地方，欢迎大家指出。**

参考学习：

> 崔庆才的个人博客
> https://cuiqingcai.com/
> 【Python3.6爬虫学习记录】（七）使用Selenium+ChromeDriver爬取知乎某问题的回答
> https://blog.csdn.net/qq_36962569/article/details/77200118