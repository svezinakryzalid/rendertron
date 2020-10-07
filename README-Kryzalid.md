## Qu'est-ce que c'est que ça?

Les crawlers des moteurs de recherche, responsables pour les résultats de recherche sur les index, et les crawlers des réseaux sociaux, responsables pour les apperçus au moment du partage d'un lien, sont toujours incapables d'exécuter Javascript et donc de rendre correctement les sites Angular, comme les sites e-closion v3.

La solution est l'utilisation d'un système de pre-rendering qui intercepte les requêtes sur les sites et les renvoi par proxy au pre-render.

Le pre-render est un script NodeJS qui utilise Chromium headless (sans UI) pour charger un URL et retourner le HTML une fois rendu.

## Installation

Voir README.md pour l'installation de Rendertron

## Utilisation

Lancer avec $ sh start.sh

Il est idéal de lancer le pre-render via un utilitaire de process management pour le relancer automatiquement en cas de pépin. 

**En date de Janvier 2020, le serveur de pre-rendering prerender.e-closion.ca roule avec PM2: https://pm2.keymetrics.io/**


## Configuration dans un site

Ajouter les lignes suivantes dans le fichier .htaccess

    <IfModule mod_proxy_http.c>
        RewriteCond %{HTTP_USER_AGENT} kryzabot|XML\ Sitemaps\ Generator|googlebot|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora\ link\ preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator|screaming [NC,OR]
        RewriteCond %{QUERY_STRING} _escaped_fragment_
        #eclosion prerender
        RewriteRule ^(?!.*?(\.svg|\.js|\.css|\.xml|\.less|\.png|\.jpg|\.jpeg|\.gif|\.pdf|\.doc|\.txt|\.ico|\.rss|\.zip|\.mp3|\.rar|\.exe|\.wmv|\.doc|\.avi|\.ppt|\.mpg|\.mpeg|\.tif|\.wav|\.mov|\.psd|\.ai|\.xls|\.mp4|\.m4a|\.swf|\.dat|\.dmg|\.iso|\.flv|\.m4v|\.torrent|\.ttf|\.woff))(.*) http://prerender.e-closion.ca:3000/render/https://%{HTTP_HOST}/$2 [P,L]
    </IfModule

## Mise à jour de notre version

Il esxite un dépôt distant "upstream" qui suit de près le [projet initial](https://github.com/GoogleChrome/rendertron) sur lequel notre repo est "forké".

Pour l'update juste merge la branche main du dépot upstream. (voir exemple)

    git branch update-core
    git merge upstream/master