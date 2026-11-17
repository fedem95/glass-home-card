# Glass Home Card

The middle of a phone home screen in one Home Assistant card:

- **Climate, covers and solar tiles** that light up when something is happening. The thermometer animates while heating (rising waves) or cooling (a turning snowflake); the solar panel glows and its sun turns while it produces.
- **The people at home** with an Enter / Leave button that follows the person looking at the dashboard: away, it shows *Enter* and *Enter by car*; at home, *Leave* and *Leave by car*.
- **Scene buttons** that run a script on a long press and show a check mark for ten seconds after it ran. A scene can take its name and icon from an entity (a time-of-day sensor, for example) and can be hidden from people who are away.

Styles: frosted glass (best over a gradient view background), Apple Home, glass, or your theme's cards. Light and dark follow Home Assistant.

Everything is set in the visual editor: no templates, no card-mod.

## Install

Copy `glass-home-card.js` to `/config/www/glass-home-card/` and add it as a dashboard resource:

```
/local/glass-home-card/glass-home-card.js?v=0.2.0
```

Type `module`. Bump `?v=` after every update.

## Example

```yaml
type: custom:glass-home-card
style: glass_light
climate_entities: [climate.living_room, climate.bedroom]
temperature_entity: sensor.indoor_temperature
humidity_entity: sensor.indoor_humidity
covers_open_entity: sensor.covers_open
solar_power_entity: sensor.inverter_power
solar_energy_entity: sensor.inverter_energy_today
person_1: person.alex
person_2: person.sam
enter_tap_action: {action: navigate, navigation_path: "#come-in"}
box_tap_action: {action: navigate, navigation_path: "#garage"}
all_tap_action: {action: navigate, navigation_path: "#scenes"}
scene_1_script: script.scene_for_time_of_day
scene_1_name_entity: sensor.time_of_day
scene_1_icon_map: "morning=mdi:weather-sunset-up, day=mdi:weather-sunny, night=mdi:weather-night"
scene_1_highlight: true
scene_2_script: script.movie
scene_2_name: Movie
scene_2_icon: mdi:popcorn
scene_2_only_home: true
```

The climate tile names rooms by their area. Which person is "looking" comes from each person's `user_id`.

## License

MIT
