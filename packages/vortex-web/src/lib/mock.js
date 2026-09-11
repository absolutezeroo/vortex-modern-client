// Placeholder content for the parts of the site the emulator has no endpoint for yet.
//
// Everything the API DOES serve — sign-in, registration, the avatar list, the SSO ticket, the name
// check, the articles, a player's whole profile, the apparts and the purse — goes through lib/api.js
// and is real. What is left mocked is the private messages and the shop's price list, both of which
// the emulator has no concept of. The shapes below are the ones a habbo.com response has, so wiring
// a real endpoint later is a swap in one page, not a rewrite of it.
//
// The articles used to live here. They are now `/api/public/articles`, and the emulator's DTOs were
// written against these very field names — id/category/title/summary/image/thumbnail/date/author —
// so the swap was a change of source, not of shape. The badges, friends and groups went the same way
// on 2026-09-11, to `/api/public/users/{uniqueId}/profile`.
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


export const SHOP_SECTIONS = [
    {
        id: 'credits',
        title: 'Crédits',
        items: [
            {id: 'c-1', name: '25 crédits', price: '1,50 EUR', icon: 1, amount: 25},
            {id: 'c-2', name: '50 crédits', price: '2,50 EUR', icon: 2, amount: 50},
            {id: 'c-3', name: '100 crédits', price: '4,50 EUR', icon: 3, amount: 100, best: true},
            {id: 'c-4', name: '250 crédits', price: '9,50 EUR', icon: 4, amount: 250},
            {id: 'c-5', name: '500 crédits', price: '17,50 EUR', icon: 5, amount: 500},
            {id: 'c-6', name: '1000 crédits', price: '29,50 EUR', icon: 6, amount: 1000},
        ],
    },
    {
        id: 'club',
        title: 'Habbo Club',
        items: [
            {id: 'hc-1', name: '1 mois de HC', price: '5,50 EUR', icon: 3, amount: 31},
            {id: 'hc-3', name: '3 mois de HC', price: '14,50 EUR', icon: 4, amount: 93, best: true},
            {id: 'hc-12', name: '12 mois de HC', price: '49,50 EUR', icon: 6, amount: 372},
        ],
    },
];
