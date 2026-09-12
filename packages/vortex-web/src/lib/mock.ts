// Placeholder content for the parts of the site the emulator has no endpoint for yet.
//
// Everything the API DOES serve — sign-in, registration, the avatar list, the SSO ticket, the name
// check, the articles, a player's whole profile, the apparts, the purse and the shop — goes through
// lib/api.js and is real. What is left mocked is the private messages, which the website has no
// endpoint for yet. The shape below is the one a habbo.com response has, so wiring a real endpoint
// later is a swap in one page, not a rewrite of it.
//
// The articles used to live here. They are now `/api/public/articles`, and the emulator's DTOs were
// written against these very field names — id/category/title/summary/image/thumbnail/date/author —
// so the swap was a change of source, not of shape. The badges, friends and groups went the same way
// on 2026-09-11, to `/api/public/users/{uniqueId}/profile`; the shop's price list on 2026-09-12, to
// `/api/public/shop/products`, where the bundles are rows an operator owns rather than a literal
// nobody could reprice without a deploy.
//
// The images are NOT placeholders: every path points into the hotel's own c_images tree (see
// lib/config.js), so the promo art, the badges and the room shots are the real ones.
//
// The wording follows habbo.com's French — "appart", not "chambre" (see lib/i18n.js: ROOMS_TITLE is
// "Galerie d'apparts"). Labels that habbo.com itself ships come from the localisation file, never
// from here.

export const MOCKED = true;

// The home's Messagerie tab. habbo.com shows at most three messages per conversation and links the
// reply into the client, so that is all this carries.
export const DISCUSSIONS = [
    {
        id: 1,
        name: 'Kaya',
        figure: 'hr-3163-45.hd-180-1.ch-3030-82.lg-275-64.sh-290-64',
        ago: 'il y a 2 heures',
        messages: [
            {text: 'Tu passes au café ce soir ?', at: '18:04'},
            {text: 'J\'ai refait toute la terrasse', at: '18:05'},
        ],
    },
    {
        id: 2,
        name: 'Milo',
        figure: 'hr-802-31.hd-180-2.ch-215-66.lg-270-82.sh-305-62',
        ago: 'hier',
        messages: [
            {text: 'Il me manque deux tapis pour finir le chantier', at: '21:12'},
        ],
    },
];
