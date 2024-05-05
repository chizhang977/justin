import{_ as a,c as e,o as s,a3 as t}from"./chunks/framework.BSgsMaz1.js";const b=JSON.parse('{"title":"4_Dokcer容器的数据卷","description":"","frontmatter":{"icon":"docker"},"headers":[],"relativePath":"docs/linux/docker/Dokcer数据卷.md","filePath":"docs/linux/docker/Dokcer数据卷.md","lastUpdated":1714888091000}'),i={name:"docs/linux/docker/Dokcer数据卷.md"},o=t('<h1 id="_4-dokcer容器的数据卷" tabindex="-1">4_Dokcer容器的数据卷 <a class="header-anchor" href="#_4-dokcer容器的数据卷" aria-label="Permalink to &quot;4_Dokcer容器的数据卷&quot;">​</a></h1><h3 id="数据卷" tabindex="-1">数据卷 <a class="header-anchor" href="#数据卷" aria-label="Permalink to &quot;数据卷&quot;">​</a></h3><ul><li>就是为了保存数据，因为容器中的数据，不提交成为镜像，容器删除后，数据也就没了</li><li>做持久化的</li></ul><h3 id="数据卷目的" tabindex="-1">数据卷目的 <a class="header-anchor" href="#数据卷目的" aria-label="Permalink to &quot;数据卷目的&quot;">​</a></h3><p>卷的设计目的就是数据的持久化，完全独立于容器的生存周期，因此Docker不会在容器删除时删除其挂载的数据卷</p><h3 id="特点" tabindex="-1">特点： <a class="header-anchor" href="#特点" aria-label="Permalink to &quot;特点：&quot;">​</a></h3><p>1：数据卷可在容器之间共享或重用数据</p><p>2：卷中的更改可以直接生效</p><p>3：数据卷中的更改不会包含在镜像的更新中</p><p>4：数据卷的生命周期一直持续到没有容器使用它为止</p><h3 id="添加数据卷" tabindex="-1">添加数据卷 <a class="header-anchor" href="#添加数据卷" aria-label="Permalink to &quot;添加数据卷&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>docker run -it -v /宿主机绝对路径目录：/容器内目录 --privileged=true 镜像名</span></span></code></pre></div><p>是否挂在成功，成功后容器和宿主机之间数据共享，容器停止推出后，主机修改后数据依然同步</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>docker inspect 容器id</span></span></code></pre></div><h3 id="带权限的数据卷" tabindex="-1">带权限的数据卷 <a class="header-anchor" href="#带权限的数据卷" aria-label="Permalink to &quot;带权限的数据卷&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>docker run -it /宿主机绝对路径目录：/容器内目录:ro/rw 镜像名</span></span></code></pre></div><h3 id="卷的继承和共享" tabindex="-1">卷的继承和共享 <a class="header-anchor" href="#卷的继承和共享" aria-label="Permalink to &quot;卷的继承和共享&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>docker run -it  --privileged=true -v /mydocker/u:/tmp --name u1 ubuntu</span></span></code></pre></div><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>docker run -it  --privileged=true --volumes-from 父类  --name u2 ubuntu</span></span></code></pre></div>',19),n=[o];function c(r,l,d,p,h,u){return s(),e("div",null,n)}const _=a(i,[["render",c]]);export{b as __pageData,_ as default};
