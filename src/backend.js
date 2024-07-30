// import English from "./locales/en.json"
import Czech from "./locales/cs.json"
import German from "./locales/de.json"
import Spanish from "./locales/es.json"
import French from "./locales/fr.json"
import Hebrew from "./locales/he.json"
import Hungarian from "./locales/hu.json"
import Italian from "./locales/it.json"
import Japanese from "./locales/ja.json"
import Korean from "./locales/ko.json"
import Polish from "./locales/pl.json"
import Portuguese from "./locales/pt.json"
import Russian from "./locales/ru.json"
import Turkish from "./locales/tr.json"
import Ukrainian from "./locales/uk.json"
import Chinese from "./locales/zh.json"

const languages = new Map()
// languages.set("en", English)
languages.set("cs", Czech)
languages.set("de", German)
languages.set("es", Spanish)
languages.set("fr", French)
languages.set("he", Hebrew)
languages.set("hu", Hungarian)
languages.set("it", Italian)
languages.set("ja", Japanese)
languages.set("ko", Korean)
languages.set("pl", Polish)
languages.set("pt", Portuguese)
languages.set("ru", Russian)
languages.set("tr", Turkish)
languages.set("uk", Ukrainian)
languages.set("zh", Chinese)

exports.httpHandler = {
    endpoints: [
        {
            method: 'GET',
            path: 'translate',
            handle: (ctx) => {
                const lang = ctx.request.getParameter('lang')
                ctx.response.json({translation: languages.get(lang)});
            }
        },
    ]
};
