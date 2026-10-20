-- Run this after creating the admin Auth user and promoting its profile to admin.
-- The script is idempotent and uses the first admin profile without a celebration.

do $$
declare
  admin_id uuid;
  v_celebration_id uuid;
begin
  select id into admin_id from public.profiles where role = 'admin' order by created_at limit 1;
  if admin_id is null then
    raise exception 'Create an Auth user, then set profiles.role = ''admin'' before running the seed.';
  end if;

  insert into public.celebrations (owner_id, title)
  values (admin_id, 'Our Little Universe')
  on conflict (owner_id) do update set title = excluded.title
  returning id into v_celebration_id;

  insert into public.app_settings (
    celebration_id, girlfriend_name, birthday, timezone, hero_message, welcome_message, love_reasons
  ) values (
    v_celebration_id,
    'My Love',
    '2026-11-08 00:00:00-06',
    'America/Costa_Rica',
    'Happy Birthday, My Love',
    'Este año no quería regalarte solamente algo que pudieras guardar. Quería regalarte momentos que podamos recordar para siempre.',
    '["Porque incluso los días ordinarios se sienten especiales contigo.","Porque haces que cualquier lugar se sienta como casa.","Porque tu risa cambia por completo el día."]'::jsonb
  ) on conflict (celebration_id) do nothing;

  if not exists (select 1 from public.events where celebration_id = v_celebration_id) then
    insert into public.events (celebration_id, title, teaser, category, starts_at, ends_at, reveal_at, status, clue, location, meeting_time, dress_code, bring, details, order_index)
    values
      (v_celebration_id, 'Pijamada especial', 'Una noche sin prisa, sólo para nosotros.', 'Quality Time', '2026-11-07 19:00:00-06', null, '2026-10-18 08:00:00-06', 'revealed', 'Piensa en comodidad, risas y nuestra película favorita.', 'Por confirmar', 'Hora por confirmar', 'Lo más cómodo que tengas', 'Tu snack favorito', 'Una noche tranquila preparada para compartir tiempo de calidad.', 1),
      (v_celebration_id, 'Brunch y cena de cumpleaños', 'Tu día tendrá dos capítulos.', 'Birthday Celebration', '2026-11-08 10:00:00-06', '2026-11-08 22:00:00-06', '2026-11-07 09:00:00-06', 'locked', 'Guarda un poquito de apetito y tu sonrisa más bonita.', 'Ubicaciones por confirmar', 'Horarios configurables', 'Casual elegante', 'Sólo ganas de celebrar', 'Brunch de cumpleaños y una cena romántica para cerrar el día.', 2),
      (v_celebration_id, 'Escapada a la playa', 'Hay un horizonte esperándonos.', 'Our Adventure', '2026-11-13 07:00:00-06', '2026-11-16 18:00:00-06', '2026-11-09 18:00:00-06', 'locked', 'Vas a necesitar bloqueador y ganas de ver el atardecer.', 'Destino por confirmar', 'Salida por confirmar', 'Ligero y tropical', 'Traje de baño, bloqueador y sombrero', 'Hospedaje, ubicación e itinerario editables desde el panel.', 3);
  end if;

  if not exists (select 1 from public.surprises where celebration_id = v_celebration_id) then
    insert into public.surprises (celebration_id, name, label, reveal_at, event_date, status, hint, message, order_index)
    values
      (v_celebration_id, 'A little something for us...', 'Envelope 01', '2026-10-18 08:00:00-06', '2026-11-07 19:00:00-06', 'revealed', 'Una noche acogedora.', 'Reserva la noche: preparé un rincón cómodo para nosotros.', 1),
      (v_celebration_id, 'For your special day', 'Envelope 02', '2026-11-07 09:00:00-06', '2026-11-08 10:00:00-06', 'locked', 'Habrá algo dulce.', 'Mañana celebraremos desde la primera taza hasta la última luz.', 2),
      (v_celebration_id, 'Our next horizon', 'Envelope 03', '2026-11-09 18:00:00-06', '2026-11-13 07:00:00-06', 'locked', 'Escucha el mar.', 'Empaca ligero: nos espera una escapada frente al océano.', 3);
  end if;

  if not exists (select 1 from public.letters where celebration_id = v_celebration_id) then
    insert into public.letters (celebration_id, title, excerpt, body, reveal_at, status, order_index)
    values
      (v_celebration_id, 'The day I met you', 'El comienzo de algo que todavía me sorprende...', 'No sabía que aquel día iba a dividir mi historia en un antes y un después.', '2026-10-18 08:00:00-06', 'published', 1),
      (v_celebration_id, 'A letter for your birthday', 'Para abrir cuando llegue tu día.', 'Esta carta es un lugar para decirte todo lo que deseo celebrar de ti.', '2026-11-08 00:01:00-06', 'published', 2),
      (v_celebration_id, 'Our future adventures', 'Hay tantos lugares que todavía quiero conocer contigo.', null, '2026-11-16 20:00:00-06', 'draft', 3);
  end if;

  if not exists (select 1 from public.missions where celebration_id = v_celebration_id) then
    insert into public.missions (celebration_id, title, prompt, kind, options, success_message, order_index)
    values
      (v_celebration_id, 'Mission 01', 'Choose the perfect outfit.', 'choice', '["Soft & romantic","Bold & elegant","Comfy & cute"]'::jsonb, 'Perfect choice. You will look beautiful.', 1),
      (v_celebration_id, 'Mission 02', 'Guess our next destination.', 'guess', '["Mountains","Beach","City lights"]'::jsonb, 'Your intuition is getting warmer…', 2),
      (v_celebration_id, 'Mission 03', 'Find the tiny heart hidden in our universe.', 'action', null, 'You found a little piece of my heart.', 3);
  end if;
end $$;
