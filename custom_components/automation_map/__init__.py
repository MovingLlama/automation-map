"""Automation Map - Visual process map for Home Assistant automations and devices."""
from __future__ import annotations

import logging
import json
from pathlib import Path

from homeassistant.core import HomeAssistant, callback
from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import area_registry as ar
from homeassistant.loader import async_get_integration

from .const import DOMAIN, PANEL_URL, PANEL_ICON, PANEL_TITLE

_LOGGER = logging.getLogger(__name__)

async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Automation Map component."""
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Automation Map from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    # Register static files path for frontend assets
    www_path = Path(__file__).parent / "www"

    await hass.http.async_register_static_paths([
        StaticPathConfig(
            f"/api/{DOMAIN}/static",
            str(www_path),
            cache_headers=False,
        )
    ])

    # Register the sidebar panel
    async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_URL,
        config={
            "_panel_custom": {
                "name": "automation-map-panel",
                "js_url": f"/api/{DOMAIN}/static/automation-map-panel.js",
                "embed_iframe": False,
                "trust_external": False,
            }
        },
        require_admin=False,
    )

    _LOGGER.info("Automation Map panel registered successfully")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    # Remove the panel
    hass.data[DOMAIN].pop(entry.entry_id, None)
    # Note: panel removal is handled by HA on integration unload
    return True
