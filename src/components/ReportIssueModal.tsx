import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  MapPin,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  FileText,
  Camera,
  Loader2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { PollutionCategory, IncidentSeverity, Incident } from '../types';
import { api } from '../services/api';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (incident: Incident) => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PollutionCategory>('air');
  const [pollutionType, setPollutionType] = useState('Industrial Stack Emissions');
  const [medium, setMedium] = useState<'air' | 'water' | 'soil' | 'noise' | 'multimedia'>('air');
  const [description, setDescription] = useState('');

  // Default Fallback: Dwarkadas J. Sanghvi College of Engineering (DJ Sanghvi)
  const DJ_SANGHVI_COORDS = { lat: 19.1075, lng: 72.8372 };
  const DJ_SANGHVI_LOCATION = 'Dwarkadas J. Sanghvi College of Engineering, Vile Parle West, Mumbai';
  const DJ_SANGHVI_REGION = 'Mumbai Suburban';

  // Automatically acquired location (no manual user input; fallback to DJ Sanghvi)
  const [location, setLocation] = useState('Detecting current GPS coordinates...');
  const [region, setRegion] = useState(DJ_SANGHVI_REGION);
  const [latitude, setLatitude] = useState(DJ_SANGHVI_COORDS.lat);
  const [longitude, setLongitude] = useState(DJ_SANGHVI_COORDS.lng);
  const [isLocating, setIsLocating] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [severityObserved, setSeverityObserved] = useState<IncidentSeverity>('High');
  const [contactPreference, setContactPreference] = useState('Email & SMS');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState<Incident | null>(null);

  // Automatically acquire device location on mount
  const acquireLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      applyDjSanghviFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        try {
          const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.location) {
              setLocation(data.location);
              setRegion(data.region || 'Mumbai Metropolitan Region');
              setIsLocating(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Geocoding API reverse lookup fallback:', e);
        }

        setLocation(`GPS Fix: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation access error, applying DJ Sanghvi default:', err.message);
        applyDjSanghviFallback();
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 10000,
      }
    );
  };

  const applyDjSanghviFallback = () => {
    setLatitude(DJ_SANGHVI_COORDS.lat);
    setLongitude(DJ_SANGHVI_COORDS.lng);
    setLocation(DJ_SANGHVI_LOCATION);
    setRegion(DJ_SANGHVI_REGION);
    setIsLocating(false);
  };

  useEffect(() => {
    if (isOpen) {
      acquireLocation();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill out the incident title and description.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.incidents.create({
        title: title.trim(),
        description: description.trim(),
        category,
        pollutionType,
        medium,
        location: location.trim(),
        region,
        latitude,
        longitude,
        severityObserved,
        contactPreference,
        evidenceUrl: imagePreview || undefined,
        evidenceName: imageName || undefined,
      });

      if (res.data) {
        setSubmittedIncident(res.data);
        onSuccess(res.data);
      }
    } catch (err: any) {
      alert(`Submission error: ${err.message || 'Please try again'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Camera className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Report Environmental Concern</h2>
              <p className="text-xs text-emerald-200/90">
                Automatic Geolocation Fix &amp; Instant AI Screening
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedIncident ? (
          /* Success & AI Instant Screening View */
          <div className="p-6 space-y-4">
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Report Successfully Submitted!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Assigned Case Tracking ID:{' '}
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {submittedIncident.id}
                </span>
              </p>
            </div>

            {submittedIncident.aiAnalysis && (
              <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/70">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Instant AI Environmental Risk Assessment</span>
                  <span className="ml-auto bg-emerald-200/60 text-emerald-900 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    Score: {submittedIncident.aiAnalysis.risk_score}/100
                  </span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {submittedIncident.aiAnalysis.incident_summary}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-emerald-200/60 text-[11px]">
                  <div>
                    <span className="font-semibold text-emerald-950 block">Risk Category:</span>
                    <span className="text-emerald-800">{submittedIncident.aiAnalysis.risk_level} Priority</span>
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-950 block">Confidence:</span>
                    <span className="text-emerald-800">{submittedIncident.aiAnalysis.confidence}% Statistical Match</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="flex justify-between">
                <span className="font-semibold">Auto-Acquired GPS Location:</span>
                <span className="text-slate-800 font-medium">{submittedIncident.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Corridor:</span>
                <span className="text-slate-800 font-medium">{submittedIncident.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Coordinates:</span>
                <span className="font-mono text-slate-800">
                  {submittedIncident.latitude.toFixed(4)}° N, {submittedIncident.longitude.toFixed(4)}° E
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Report Submission Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Automatic GPS Location Locked Card */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-2xl p-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    {isLocating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <MapPin className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        Automatic GPS Location
                      </span>
                      <span className="bg-emerald-200 text-emerald-900 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-800" />
                        Tamper-Proof
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                      {isLocating ? 'Acquiring high-accuracy satellite fix...' : location}
                    </p>

                    <p className="text-xs text-slate-600 font-mono mt-0.5">
                      Coordinates: {latitude.toFixed(5)}° N, {longitude.toFixed(5)}° E • Region: {region}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={acquireLocation}
                  disabled={isLocating}
                  className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs disabled:opacity-50"
                  title="Re-acquire current location"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  Re-fix
                </button>
              </div>

              <div className="mt-2.5 pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-800/90 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>
                  Location is captured automatically from device telemetry. Manual entry is disabled to ensure regulatory evidentiary chain-of-custody.
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Incident Headline <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Heavy chemical fumes discharged from industrial stack at night"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
              />
            </div>

            {/* Category & Specific Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pollution Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    const cat = e.target.value as PollutionCategory;
                    setCategory(cat);
                    if (cat === 'water') {
                      setMedium('water');
                      setPollutionType('Toxic Effluent Discharge');
                    } else if (cat === 'noise') {
                      setMedium('noise');
                      setPollutionType('Heavy Equipment Noise');
                    } else if (cat === 'waste') {
                      setMedium('soil');
                      setPollutionType('Hazardous Solid Waste Dumping');
                    } else {
                      setMedium('air');
                      setPollutionType('Industrial Stack Emissions');
                    }
                  }}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="air">Air Pollution</option>
                  <option value="water">Water Pollution</option>
                  <option value="industrial">Industrial Emissions</option>
                  <option value="waste">Waste Dumping</option>
                  <option value="noise">Noise Pollution</option>
                  <option value="soil">Soil Contamination</option>
                  <option value="chemical">Chemical Leakage</option>
                  <option value="other">Other Concern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Environmental Medium</label>
                <select
                  value={medium}
                  onChange={(e) => setMedium(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="air">Air</option>
                  <option value="water">Surface Water / Groundwater</option>
                  <option value="soil">Soil / Land</option>
                  <option value="noise">Acoustic / Noise</option>
                  <option value="multimedia">Multi-Media Impact</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observed Severity</label>
                <select
                  value={severityObserved}
                  onChange={(e) => setSeverityObserved(e.target.value as IncidentSeverity)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                >
                  <option value="Low">Low (Nuisance)</option>
                  <option value="Moderate">Moderate (Noticeable)</option>
                  <option value="High">High (Distress / Disruption)</option>
                  <option value="Critical">Critical (Immediate Hazard)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Description &amp; Health Observations <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe odor, color, duration, affected neighbors, visible sources, or physical symptoms (e.g., eye stinging, coughing)..."
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Photo Asset &amp; Evidentiary Proof
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50 transition-colors">
                {imagePreview ? (
                  <div className="flex items-center gap-3 justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-xl border border-slate-300"
                    />
                    <div className="text-left text-xs">
                      <p className="font-semibold text-slate-800 line-clamp-1">{imageName}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageName('');
                        }}
                        className="text-rose-600 hover:text-rose-700 underline text-[11px] mt-1"
                      >
                        Remove photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <label className="cursor-pointer text-xs font-semibold text-emerald-800 hover:text-emerald-700 underline">
                      <span>Click to upload evidence photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG or WEBP up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || isLocating}
                className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-900/10 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing &amp; Filing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    Submit &amp; Run Risk Screening
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
