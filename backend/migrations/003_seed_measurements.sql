INSERT INTO measurements (
  weight_kg,
  height_cm,
  age,
  sex,
  activity_level,
  bmi,
  bmi_category,
  bmr,
  daily_calories,
  measurement_date,
  created_at
)
SELECT *
FROM (
  VALUES
    (78.0, 178.0, 31, 'male', 'moderate', 24.6, 'Normal', 1738, 2694, CURRENT_DATE - INTERVAL '14 days', now() - INTERVAL '14 days'),
    (77.2, 178.0, 31, 'male', 'moderate', 24.4, 'Normal', 1730, 2682, CURRENT_DATE - INTERVAL '10 days', now() - INTERVAL '10 days'),
    (76.4, 178.0, 31, 'male', 'moderate', 24.1, 'Normal', 1722, 2669, CURRENT_DATE - INTERVAL '6 days', now() - INTERVAL '6 days'),
    (75.8, 178.0, 31, 'male', 'active', 23.9, 'Normal', 1716, 2960, CURRENT_DATE - INTERVAL '3 days', now() - INTERVAL '3 days'),
    (75.2, 178.0, 31, 'male', 'active', 23.7, 'Normal', 1710, 2950, CURRENT_DATE - INTERVAL '1 day', now() - INTERVAL '1 day')
) AS seed_data (
  weight_kg,
  height_cm,
  age,
  sex,
  activity_level,
  bmi,
  bmi_category,
  bmr,
  daily_calories,
  measurement_date,
  created_at
)
WHERE NOT EXISTS (
  SELECT 1 FROM measurements
);
