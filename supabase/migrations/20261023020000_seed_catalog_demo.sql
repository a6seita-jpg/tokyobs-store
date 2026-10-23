-- Seed initial editable categories only when the slug does not exist.
insert into public.categories(name,slug,description,image_url,theme_color,sort_order,active)
values
 ('Steam','steam','Keys e combos Steam','', '#1B74E4',1,true),
 ('Paramount+','paramount','Assinaturas e streaming','', '#0064FF',2,true),
 ('Netflix','netflix','Assinaturas e streaming','', '#E50914',3,true),
 ('Spotify','spotify','Música e streaming','', '#1ED760',4,true),
 ('Prime Video','prime-video','Assinaturas e streaming','', '#00A8E1',5,true),
 ('Crunchyroll','crunchyroll','Anime e streaming','', '#FF7A00',6,true),
 ('Disney+','disney-plus','Assinaturas e streaming','', '#113CCF',7,true)
on conflict(slug) do nothing;
