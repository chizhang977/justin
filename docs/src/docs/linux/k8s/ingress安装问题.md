---
layout: doc
aside: false
---
# 踩过的坑
## The connection to the server lb.kubesphere.local:6443 was refused - did you specify the right host..
[我已经解决了写在csdn中](https://blog.csdn.net/weixin_50135832/article/details/139562948?spm=1001.2014.3001.5502)
## dashboard 安装
![](/assets/image/docker/dash.png)
需要在浏览器中输入`thisisunsafe`,即可进入登录页面
![](/assets/image/docker/board.png)
## ingress 安装的问题
问题描述：
安装后通过命令 `kubectl get pod,svc -n ingress-nginx` 查看是否成功
```bash      
[root@k8s-master ~]# kubectl get pod,svc -n ingress-nginx
NAME                                            READY   STATUS               RESTARTS   AGE
pod/ingress-nginx-controller-68466b9c78-p4wq9   0/1     ContainerCreating     0          35m

NAME                                         TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)                      AGE
service/ingress-nginx-controller             NodePort    10.96.47.75   <none>        80:31885/TCP,443:30125/TCP   35m
service/ingress-nginx-controller-admission   ClusterIP   10.96.36.48   <none>        443/TCP                      35m
```
35m后了，pod肯定出现错误了，查看日志
```bash
kubectl describe pod  ingress-nginx-controller-68466b9c78-p4wq9 -n ingress-nginx


#...
#kubelet MountVolume.SetUp failed for volume “webhook-cert” : secret “ingress-nginx-admission” not found
```

查看ingress的相关`secret`
```bash
[root@k8s-master ~]# kubectl get secret -A|grep ingress
ingress-nginx          default-token-86n8q                              kubernetes.io/service-account-token   3      41m
ingress-nginx          ingress-nginx-admission-token-6pwvg              kubernetes.io/service-account-token   3      41m
ingress-nginx          ingress-nginx-token-4p9qk                        kubernetes.io/service-account-token   3      41m
```
`ingress-nginx-admission-token-6pwvg `  
`ingress-nginx-controller-68466b9c78-p4wq9`的yaml文件里面`ingress-nginx-admission`不相同，所以报错

查看nginx-ingress-controller-8tqkqy的yaml文件，里面的secret是ingress-nginx-admission
```bash
kubectl get pod ingress-nginx-controller-68466b9c78-p4wq9 -n ingress-nginx -o yaml
```
复制一个与ingress-nginx-controller-68466b9c78-p4wq9内容相同的secret，命名为ingress-nginx-admission
```bash
#将ingress-nginx-controller-68466b9c78-p4wq9的yaml导出为文件secret.yaml
kubectl get secret ingress-nginx-admission-token-6pwvg -n ingress-nginx -o yaml > secret.yaml
vi secret.yaml
```
将name修改成ingress-nginx-admission
再执行命令，将secret进行添加
```bash
kubectl apply -f secret.yaml
```                        
:::tip
>参考文章：https://blog.csdn.net/weixin_44593275/article/details/126322099
:::

## Nginx Ingress Controller - Failed Calling Webhook [closed]
这个问题困扰了我许久，最后在[StackOverflow](https://stackoverflow.com/questions/61616203/nginx-ingress-controller-failed-calling-webhook)上找到了解决的办法
```bash
kubectl delete -A ValidatingWebhookConfiguration ingress-nginx-admission
```

## DevOps 流水线运行状态显示为“未运行”
::: tip [kubesphere 开发者社区](https://ask.kubesphere.io/forum/d/9277-devops-maven-is-offline/2)
- 使用 devops-config 中这个 devops/password 替换 secret kubesphere-secret 中的 token；
- 使用 devops-config 中这个 devops/password，替换 kubesphere-config 中的 devops/password；
- 重启 Deployment ks-controller-manager ；
::: 
之后修改完重启之后还是还是不行，最后修改了用户的密码，触发下账户同步，问题解决
## 可以运行了但是一直卡在那里

![bug](/assets/image/docker/未运行.png))

这个问题的原因是没有命名空间`kubesphere-devops-worker`
```bash
kubectl create namespace kubesphere-devops-worker
```
问题得以解决。

## maven-xxx is offline
![](/assets/image/docker/offline.png)
查看对应的pod 
`MountVolume.SetUp failed for volume "config-volume" : configmap "ks-devops-agent" not found`

之后创建了`ks-devops-agent`这个configmap，在命名空间中创建了`kubesphere-devops-worker`这个configmap，问题解决。
个人感觉千万不要用最新版的kubesphere，因为真的会出现很多很多的bug，真的有时候想放弃，最后选择了降版本，有的问题就不会出现。
## 密码忘记了
```bash
kubectl edit usesr admin
kubectl get uses admin
```
## not ready after 5000 MILLISECONDS
在并行执行流水线中，就会出现此错误,之后在kubesphere 的开发者社区看到有解决方案。

>再有就是可以尝试修改下 jenkins-casc-config 这个 configmap 中，下面 jenkins-user.yaml 部分，maven 对应的 jnlp 容器的 memory 和 cpu limit 修改大点，再试试是否有好转。
```bash
- name: "maven"
  namespace: "kubesphere-devops-worker"
  label: "maven"
  nodeUsageMode: "EXCLUSIVE"
  idleMinutes: 0
  containers:
  - name: "maven"
    image: "registry.cn-beijing.aliyuncs.com/kubesphereio/builder-maven:v3.2.0"
    command: "cat"
    args: ""
    ttyEnabled: true
    privileged: false
    # 增加CPU和内存资源请求与限制
    resourceRequestCpu: "500m"        # 原100m调整为500m
    resourceLimitCpu: "8000m"         # 原4000m调整为8000m
    resourceRequestMemory: "1024Mi"   # 原100Mi调整为1024Mi
    resourceLimitMemory: "16384Mi"    # 原8192Mi调整为16384Mi
  - name: "jnlp"
    image: "registry.cn-beijing.aliyuncs.com/kubesphereio/inbound-agent:4.10-2"
    args: "^${computer.jnlpmac} ^${computer.name}"
    # 对jnlp容器的资源也进行相应的增加
    resourceRequestCpu: "200m"        # 原50m调整为200m
    resourceLimitCpu: "1000m"         # 原500m调整为1000m
    resourceRequestMemory: "800Mi"    # 原400Mi调整为800Mi
    resourceLimitMemory: "3072Mi"     # 原1536Mi调整为3072Mi
  workspaceVolume:
    emptyDirWorkspaceVolume:
      memory: false
  volumes:
  - hostPathVolume:
      hostPath: "/var/run/docker.sock"
      mountPath: "/var/run/docker.sock"
  - hostPathVolume:
      hostPath: "/var/data/jenkins_maven_cache"
      mountPath: "/root/.m2"
  - hostPathVolume:
      hostPath: "/var/data/jenkins_sonar_cache"
      mountPath: "/root/.sonar/cache"
```
但是调整了还是没有解决。
逛了一下 [StackOverFlow](https://stackoverflow.com/search?q=not+ready+after+5000+MILLISECONDS)、[github](https://github.com/fabric8io/kubernetes-client/issues/3795) 有关此问题的解决方案，里面解决方案都不能成功。我看到开发者社区中有人说超过十个并发就会有这个错误（不太准确），因为我正好十个，我就有个想法，为什么一定要并行执行，我把这并发十个微服务拆成两个小并发的执行，之后成功了。

