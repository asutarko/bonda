-- Run this once in the Supabase Dashboard → SQL Editor for this project.
-- Replaces the placeholder "Indonesian Citizen" / "Foreign Citizen" rows from
-- nationalities.sql with the full list of nationalities shown in the
-- Nationality select on Edit User Profile. Idempotent: skips any name that
-- already exists.

delete from public.nationalities where name in ('Indonesian Citizen', 'Foreign Citizen');

insert into public.nationalities (name, sort_order)
select t.name, t.ord - 1
from unnest(array[
  'Afghan', 'Albanian', 'Algerian', 'American', 'Andorran', 'Angolan', 'Argentine',
  'Armenian', 'Australian', 'Austrian', 'Azerbaijani', 'Bahamian', 'Bahraini',
  'Bangladeshi', 'Barbadian', 'Belarusian', 'Belgian', 'Belizean', 'Beninese',
  'Bhutanese', 'Bolivian', 'Bosnian', 'Botswanan', 'Brazilian', 'British',
  'Bruneian', 'Bulgarian', 'Burkinabé', 'Burundian', 'Cambodian', 'Cameroonian',
  'Canadian', 'Cape Verdean', 'Central African', 'Chadian', 'Chilean', 'Chinese',
  'Colombian', 'Comoran', 'Congolese', 'Costa Rican', 'Croatian', 'Cuban',
  'Cypriot', 'Czech', 'Danish', 'Djiboutian', 'Dominican', 'Dutch', 'East Timorese',
  'Ecuadorian', 'Egyptian', 'Emirati', 'Equatorial Guinean', 'Eritrean', 'Estonian',
  'Ethiopian', 'Fijian', 'Filipino', 'Finnish', 'French', 'Gabonese', 'Gambian',
  'Georgian', 'German', 'Ghanaian', 'Greek', 'Grenadian', 'Guatemalan', 'Guinean',
  'Guyanese', 'Haitian', 'Honduran', 'Hong Konger', 'Hungarian', 'Icelandic',
  'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Irish', 'Israeli', 'Italian',
  'Ivorian', 'Jamaican', 'Japanese', 'Jordanian', 'Kazakhstani', 'Kenyan',
  'Kiribati', 'Kuwaiti', 'Kyrgyzstani', 'Laotian', 'Latvian', 'Lebanese',
  'Liberian', 'Libyan', 'Liechtensteiner', 'Lithuanian', 'Luxembourgish',
  'Macanese', 'Macedonian', 'Malagasy', 'Malawian', 'Malaysian', 'Maldivian',
  'Malian', 'Maltese', 'Marshallese', 'Mauritanian', 'Mauritian', 'Mexican',
  'Micronesian', 'Moldovan', 'Monégasque', 'Mongolian', 'Montenegrin', 'Moroccan',
  'Mozambican', 'Myanmar (Burmese)', 'Namibian', 'Nauruan', 'Nepalese',
  'New Zealander', 'Nicaraguan', 'Nigerian', 'Nigerien', 'North Korean',
  'Norwegian', 'Omani', 'Pakistani', 'Palauan', 'Palestinian', 'Panamanian',
  'Papua New Guinean', 'Paraguayan', 'Peruvian', 'Polish', 'Portuguese',
  'Qatari', 'Romanian', 'Russian', 'Rwandan', 'Saint Lucian', 'Salvadoran',
  'Samoan', 'San Marinese', 'São Toméan', 'Saudi', 'Senegalese', 'Serbian',
  'Seychellois', 'Sierra Leonean', 'Singaporean', 'Slovak', 'Slovenian',
  'Solomon Islander', 'Somali', 'South African', 'South Korean', 'South Sudanese',
  'Spanish', 'Sri Lankan', 'Sudanese', 'Surinamese', 'Swazi', 'Swedish', 'Swiss',
  'Syrian', 'Taiwanese', 'Tajikistani', 'Tanzanian', 'Thai', 'Togolese', 'Tongan',
  'Trinidadian', 'Tunisian', 'Turkish', 'Turkmen', 'Tuvaluan', 'Ugandan',
  'Ukrainian', 'Uruguayan', 'Uzbekistani', 'Vanuatuan', 'Venezuelan', 'Vietnamese',
  'Yemeni', 'Zambian', 'Zimbabwean', 'Prefer not to say'
]) with ordinality as t(name, ord)
where not exists (select 1 from public.nationalities n where n.name = t.name);
