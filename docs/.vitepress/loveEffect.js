document.addEventListener('click', (e) => {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.style.left = e.pageX + 'px';
    heart.style.top = e.pageY + 'px';
    document.body.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 1000);
});

// 简单的CSS动画用行内样式表示
const style = document.createElement('style');
style.innerHTML = `
.heart {
    position: absolute;
    width: 20px;
    height: 20px;
    background: red;
    border-radius: 50% 50% 0;
    transform: rotate(45deg);
    animation: beat .5s infinite alternate;
}

@keyframes beat {
    to {transform: scale(1.2, 1.2);}
}
`;
document.head.appendChild(style);