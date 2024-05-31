---
layout: doc
aside: false
---
#踩过的坑
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
