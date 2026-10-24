import json
import os
from typing import List, Dict, Any, Optional

KNOWLEDGE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(KNOWLEDGE_DIR, "data")

class KnowledgeRetriever:
    _medications: List[Dict[str, Any]] = []
    _protocols: List[Dict[str, Any]] = []

    @classmethod
    def initialize(cls):
        meds_path = os.path.join(DATA_DIR, "medications.json")
        if os.path.exists(meds_path):
            with open(meds_path, "r", encoding="utf-8") as f:
                cls._medications = json.load(f)

        protocols_path = os.path.join(DATA_DIR, "clinical_protocols.json")
        if os.path.exists(protocols_path):
            with open(protocols_path, "r", encoding="utf-8") as f:
                cls._protocols = json.load(f)

    @classmethod
    def get_all_medications(cls) -> List[Dict[str, Any]]:
        if not cls._medications:
            cls.initialize()
        return cls._medications

    @classmethod
    def search_medications(cls, query: str) -> List[Dict[str, Any]]:
        meds = cls.get_all_medications()
        if not query:
            return meds
        q = query.lower().strip()
        results = []
        for m in meds:
            if (q in m["name"].lower() or 
                q in m["generic_name"].lower() or 
                q in m["drug_class"].lower() or
                any(q in u.lower() for u in m.get("common_uses", []))):
                results.append(m)
        return results

    @classmethod
    def get_medication_by_name(cls, name: str) -> Optional[Dict[str, Any]]:
        meds = cls.get_all_medications()
        q = name.lower().strip()
        for m in meds:
            if m["id"] == q or q in m["name"].lower() or q in m["generic_name"].lower():
                return m
        return None

    @classmethod
    def find_clinical_guidelines(cls, text: str) -> List[Dict[str, Any]]:
        if not cls._protocols:
            cls.initialize()
        if not text:
            return []
        
        q = text.lower()
        matched = []
        for protocol in cls._protocols:
            for kw in protocol.get("keywords", []):
                if kw.lower() in q:
                    matched.append(protocol)
                    break
        return matched

# Auto-initialize at load
KnowledgeRetriever.initialize()
