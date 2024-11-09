// https://github.com/nuxt-themes/docus/blob/main/nuxt.schema.ts
export default defineAppConfig({
  docus: {
    title: "Salesforce to Quickbooks Automation",
    description: `Seamlessly Automate Your QuickBooks with Salesforce Data`,
    url: "https://salesforce.mediajel.com",
    socials: {
      github: "MediaJel/salesforce-automation",
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
          text: "Built with ❤️ by MediaJel",
          href: "https://www.mediajel.com/",
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
