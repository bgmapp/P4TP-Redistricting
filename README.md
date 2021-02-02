# Mapping Community with People for the People

[Live Example](https://jwmazzi.github.io/P4TP-Redistricting/)

This repository contains 2 Widgets that can be deployed with 
[Experience Builder](https://developers.arcgis.com/experience-builder/guide/) and are used to help communities
explore how boundaries might be drawn for various purposes. 

## Configuring & Deploying This Application

This first step to getting this application running is to fork the PFTP-Redistricting repository. After you've forked the repo, do the following to get the application running with the Hosted Feature Layer (HFL) provided by People for the People:

* Inside the /docs directory, open the config.json file. 
* Start editing the config.json and find the editDistrictsURL property toward the bottom. 
* Update this value with your personal HFL and then select Commit changes. 

With the configuration updated, we just need to deploy the application for others to consume. There are a number of ways to deploy this React application, but one simple way is to use [GitHub Pages](https://pages.github.com/). After getting the configuration set up with your HFL , you can consult this [documentation](https://docs.github.com/en/github/working-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) and complete the following steps:

* Go to the Settings tab and scroll down to the GitHub Pages section.
* Select the main branch and then choose the /docs folder as the publication source. 

## Extending These Widgets with ArcGIS Experience Builder

In order to extend these custom Widgets within ArcGIS Experience Builder Developer Edition, you will need an [ArcGIS for Developers](https://developers.arcgis.com/) account. Once you have an ArcGIS for Developers account, follow the [installation guide](https://developers.arcgis.com/experience-builder/guide/install-guide/) for ArcGIS Experience Builder Developer Edition and copy the Widgets in this repository to the **client\your-extensions\widgets** directory.

Development Dependencies
- [Calcite React](https://calcite-react.netlify.app)
- [Calcite React Icons](https://calcite-react.netlify.app/icons)
- [Calcite Web](https://esri.github.io/calcite-web/documentation/#npm)
- [Recharts](https://recharts.org/en-US/)
