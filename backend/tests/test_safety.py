from app.safety.emergency_detector import EmergencyDetector

def test_chest_pain_emergency_en():
    text = "I have severe chest pain and pressure since 10 minutes ago"
    is_emergency, alert = EmergencyDetector.evaluate(text, language="en")
    assert is_emergency is True
    assert alert is not None
    assert alert.category == "CARDIAC"
    assert "Cardiac" in alert.headline or "Heart" in alert.headline
    assert any("112" in num or "911" in num for num in alert.emergency_numbers.values())

def test_chest_pain_emergency_hi():
    text = "मेरे सीने में दर्द हो रहा है और बेचैनी लग रही है"
    is_emergency, alert = EmergencyDetector.evaluate(text, language="hi")
    assert is_emergency is True
    assert alert is not None
    assert alert.category == "CARDIAC"
    assert "आपातकालीन" in alert.headline or "हृदय" in alert.headline

def test_difficulty_breathing_emergency():
    text = "My chest feels tight and I am having difficulty breathing."
    is_emergency, alert = EmergencyDetector.evaluate(text, language="en")
    assert is_emergency is True
    assert alert is not None
    # Can match cardiac or respiratory
    assert alert.category in ["CARDIAC", "RESPIRATORY"]

def test_suicide_crisis_emergency():
    text = "I feel hopeless and want to end my life"
    is_emergency, alert = EmergencyDetector.evaluate(text, language="en")
    assert is_emergency is True
    assert alert is not None
    assert alert.category == "PSYCHIATRIC_CRISIS"
    assert any("988" in act or "14416" in act for act in alert.immediate_actions)

def test_stroke_fast_symptoms():
    text = "My grandfather has sudden facial drooping and slurred speech"
    is_emergency, alert = EmergencyDetector.evaluate(text, language="en")
    assert is_emergency is True
    assert alert is not None
    assert alert.category == "STROKE_NEURO"

def test_non_emergency_query():
    text = "I have a mild runny nose and sneezing after dusting my room."
    is_emergency, alert = EmergencyDetector.evaluate(text, language="en")
    assert is_emergency is False
    assert alert is None
