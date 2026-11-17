# Glass Home Card

A whole phone home screen in one Home Assistant card, designed to fit an iPhone without scrolling:

- **Greeting** with the time of day and a short subtitle that only speaks up when it matters: power outage (with UPS runtime), nobody home with the alarm off, doors left open, lights on in an empty home, and the alarm state.
- **Pills** for lights on, covers, alarm, door and garage, each opening its own pop-up.
- **Calendar and weather slots** that embed other cards as they are (for example *Calendar Card Pro* and *Animated Weather Card*), so they keep updating with their own developers. The card sets their height and corners and can lay a tip pill ("Air the house") over the weather.
- **Climate, covers and solar tiles** that light up when something is happening. The thermometer animates while heating or cooling; the solar panel glows while it produces. A humidity chip on the climate tile opens its own pop-up.
- **The people at home** with an Enter / Leave button that follows the person looking at the dashboard.
- **Scene buttons** that run a script on a long press (the button fills with colour while you hold, then a check mark), stay filled while active, and can take their name and icon from an entity.

Styles: frosted glass (best over a gradient view background, see `backgrounds/aurora.svg`), Apple Home, glass, or your theme's cards. A compact mode tightens the spacing. Light and dark follow Home Assistant.

Everything is set in the visual editor, with tabs for the general options and for the embedded weather and calendar cards (their own visual editors when available, YAML otherwise).

## Install

Copy `glass-home-card.js` to `/config/www/glass-home-card/` and add it as a dashboard resource:

```
/local/glass-home-card/glass-home-card.js?v=0.5.8
```

Type `module`. Bump `?v=` after every update. Optional background: copy `backgrounds/aurora.svg` next to it and set it as the view background (`/local/glass-home-card/aurora.svg`).

## Example

```yaml
type: custom:glass-home-card
style: glass_light
compact: true
greeting_entity: sensor.time_of_day
alarm_entity: alarm_control_panel.home
alert_entities: [binary_sensor.front_door]
alert_names: "binary_sensor.front_door=Front door open"
pill_1_entity: [light.all_lights]
pill_2_entity: [alarm_control_panel.home]
calendar_card:
  type: custom:calendar-card-pro
  entities: [calendar.family]
  list: {compact_events_to_show: 1}
weather_card:
  type: custom:animated-weather-card
  entity: weather.home
weather_height: 200
tip_1_entity: binary_sensor.air_the_house
climate_entities: [climate.living_room, climate.bedroom]
temperature_entity: sensor.indoor_temperature
humidity_entity: sensor.indoor_humidity
humidity_tap_action: {action: navigate, navigation_path: "#humidity"}
covers_open_entity: sensor.covers_open
solar_power_entity: sensor.inverter_power
solar_energy_entity: sensor.inverter_energy_today
person_1: person.alex
person_2: person.sam
enter_tap_action: {action: navigate, navigation_path: "#come-in"}
box_tap_action: {action: navigate, navigation_path: "#garage"}
all_tap_action: {action: navigate, navigation_path: "#scenes"}
scenes_active_since: sensor.time_of_day
scene_1_script: script.scene_for_time_of_day
scene_1_name_entity: sensor.time_of_day
scene_2_script: script.movie
scene_2_name: Movie
scene_2_icon: mdi:popcorn
scene_2_only_home: true
```

The climate tile names rooms by their area. Which person is "looking" comes from each person's `user_id`.

## License

MIT
