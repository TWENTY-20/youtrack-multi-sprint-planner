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


function indexOfId(input, customFieldsString) {
    if (input === null) return -1
    const ids = input.map(i => {
        const idd = readCustomFields(i)?.id
        if (idd === undefined) {
            return 'no-id';
        }
        return idd
    })
    const search = readCustomFields(customFieldsString)?.id
    if (search === undefined) {
        return -1
    }
    return ids.indexOf(search);
}

export function readCustomFields(input) {
    const splitted = input.split('&', 2)
    if (splitted.length !== 2) {
        return null
    }
    try {
        const fields = JSON.parse(splitted[1])
        return {
            id: splitted[0],
            fields: fields
        }
    } catch (e) {
        console.error(e)
        return null
    }
}


// eslint-disable-next-line no-undef,@typescript-eslint/no-unsafe-member-access
exports.httpHandler = {
    endpoints: [
        {
            method: 'GET',
            path: 'translate',
            handle: (ctx) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                const lang = ctx.request.getParameter('lang')
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
                ctx.response.json({translation: languages.get(lang)});

            }
        }, {
            method: 'POST',
            path: 'saveCustomFields',
            handle: function handle(ctx) {
                const body = JSON.parse(ctx.request.body)
                ctx.globalStorage.extensionProperties.selectedCustomFields = body.customFields;
                ctx.response.json({body: body});
            }
        }, {
            method: 'GET',
            path: 'getCustomFields',
            handle: function handle(ctx) {
                const fields = ctx.globalStorage.extensionProperties.selectedCustomFields;
                if (fields === undefined) {
                    ctx.response.json({result: null});
                    return;
                }
                ctx.response.json({result: fields});
            }
        },
        {
            method: 'GET',
            path: 'test',
            handle: function handle(ctx) {
                ctx.response.json({result: "test"});
            }
        }

    ]
};

