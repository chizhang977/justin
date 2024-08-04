<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://zldevops.github.io/blog/blog/avatar.jpg',
    name: 'zldevops',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/Zldevops' },
      
    ]
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/84006554?v=4',
    name: 'justin',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/chizhang977' },
     
    ]
  },

]
</script>



# 友情链接

<VPTeamMembers size="small" :members="members" />