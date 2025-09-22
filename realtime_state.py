from datetime import datetime
from typing import Optional, Dict


def now_iso() -> str:
    from datetime import datetime as _dt
    return _dt.utcnow().isoformat() + 'Z'


# Global in-memory agent state (demo only). For production, use Redis or DB.
AGENTS: Dict[str, dict] = {}


def set_agent_status(username: str, status: str, current_call_id: Optional[str] = None) -> dict:
    AGENTS.setdefault(username, {})
    AGENTS[username]['status'] = status
    AGENTS[username]['currentCallId'] = current_call_id
    AGENTS[username]['lastUpdate'] = now_iso()
    return {'username': username, **AGENTS[username]}


def pick_available_agent() -> Optional[str]:
    for uname, info in AGENTS.items():
        if info.get('status') == 'available':
            return uname
    return None


