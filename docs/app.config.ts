// https://github.com/nuxt-themes/docus/blob/main/nuxt.schema.ts
export default defineAppConfig({
  docus: {
    title: "Pachtop",
    description: `Pachtop - a more modern system monitor. Pachtop is a lightweight, performant, and opensource system monitor that provides real-time monitoring of your system's performance, application monitoring, and detailed system information`,
    url: "https://pachtop.com",
    socials: {
      github: "pacholoamit/pachtop",
      youtube: "@pacholoamit",
      linkedin: {
        label: "Pacholo Amit",
        icon: "fa6-brands:linkedin-in",
        href: "https://www.linkedin.com/in/pacholo-amit/",
      },
    },
    github: {
      dir: ".starters/default/content",
      branch: "main",
      repo: "docus",
      owner: "nuxt-themes",
      edit: false,
    },
    aside: {
      level: 0,
      collapsed: false,
      exclude: [],
    },
    main: {
      padded: false,
      fluid: true,
    },
    footer: {
      credits: false,
      textLinks: [
        {
          text: "Built with ❤️ by Pacholo Amit",
          href: "https://www.pacholoamit.com",
          rel: "noopener",
          target: "_blank",
        },
      ],
    },
    header: {
      logo: true,
      showLinkIcon: true,
      exclude: [],
      fluid: true,
    },
  },
  umami: {
    version: 2,
  },
});
