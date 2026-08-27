// Placeholder content for the parts of the site the emulator has no endpoint for yet.
//
// Everything the API DOES serve — sign-in, registration, the avatar list, the SSO ticket, the name
// check, AND the articles — goes through lib/api.js and is real. What is left mocked is the social
// surface: badges, groups, apparts, friends, the shop's price list. The shapes below are the ones a
// habbo.com response has, so wiring a real endpoint later is a swap in one page, not a rewrite of it.
//
// The articles used to live here. They are now `/api/public/articles`, and the emulator's DTOs were
// written against these very field names — id/category/title/summary/image/thumbnail/date/author —
// so the swap was a change of source, not of shape.
//
// The images are NOT placeholders: every path points into the hotel's own c_images tree (see
// lib/config.js), so the promo art, the badges and the room shots are the real ones.
//
// The wording follows habbo.com's French — "appart", not "chambre" (see lib/i18n.js: ROOMS_TITLE is
// "Galerie d'apparts"). Labels that habbo.com itself ships come from the localisation file, never
// from here.

export const MOCKED = true;

export const BADGES = [
    {code: 'ACH_BasicClub1', name: 'Membre du club'},
    {code: 'ACH_Login5', name: 'Habitué'},
    {code: 'ACH_RoomEntry1', name: 'Explorateur'},
    {code: 'ACH_FriendListSize2', name: 'Sociable'},
    {code: 'HC1', name: 'Habbo Club'},
    {code: 'GLD', name: 'Or'},
    {code: 'ES1', name: 'Étoile'},
    {code: 'ADM', name: 'Équipe'},
];

export const FRIENDS = [
    {name: 'Kaya', figure: 'hr-3163-45.hd-180-1.ch-3030-82.lg-275-64.sh-290-64', online: true, motto: 'On se retrouve au café'},
    {name: 'Milo', figure: 'hr-802-31.hd-180-2.ch-215-66.lg-270-82.sh-305-62', online: true, motto: 'Constructeur du dimanche'},
    {name: 'Nova', figure: 'hr-3090-42.hd-600-2.ch-665-71.lg-3116-92.sh-3068-64', online: false, motto: 'Absente, laissez un mot'},
    {name: 'Rafa', figure: 'hr-165-45.hd-190-10.ch-210-66.lg-270-82.sh-290-80', online: false, motto: ''},
    {name: 'Sora', figure: 'hr-3012-45.hd-605-8.ch-635-70.lg-3078-64.sh-3016-64', online: true, motto: 'Ouvre son appart à 20h'},
];

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

export const GROUPS = [
    {id: 1, name: 'Les Bâtisseurs', badge: 'b0805Xs09114s2c144d0', members: 214, motto: 'On construit, vous visitez'},
    {id: 2, name: 'Café du coin', badge: 'b1305Xs05013s09114', members: 87, motto: 'Le rendez-vous de 18h'},
    {id: 3, name: 'Chasseurs de rares', badge: 'b2005Xs11013s02114', members: 43, motto: 'Trocs sérieux uniquement'},
];

// `rating` and `tags` are habbo.com's own appart fields — the room page shows both ("Note: 1624",
// "club, disco"), so the mock carries them rather than leaving two empty rows.
export const ROOMS = [
    {id: 101, name: 'Le grand café', owner: 'Kaya', users: 24, maxUsers: 50, rating: 1624, tags: ['cafe', 'detente'], description: 'Ouvert tous les soirs, musique douce et canapés libres.'},
    {id: 102, name: 'Chantier du quartier', owner: 'Milo', users: 8, maxUsers: 25, rating: 312, tags: ['construction'], description: 'Construction en cours, venez donner un coup de main.'},
    {id: 103, name: 'Salle de jeux', owner: 'Nova', users: 31, maxUsers: 50, rating: 908, tags: ['jeux', 'tournoi'], description: 'Tournois tous les samedis à 21h.'},
];

// The purse. Real hotels read these off the player; the web API has no route for them yet, so the
// five counters are fixed. This is the one mock a visitor could mistake for live data, which is why
// it is called out here rather than buried in the component.
export const PURSE = {
    credits: 12480,
    diamonds: 36,
    duckets: 2145,
    hcDays: 27,
    buildersFurni: 50,
};

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
