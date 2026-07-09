/**
 * pages/profile/MedicalInfoTab.jsx — Critical Medical Information Editor
 *
 * Premium:
 * - Rounded focus rings for textareas
 * - Notice warnings styled with left accents and alert banners
 * - Save button isDisabled visual state polish
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaHeartbeat, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

import {
  fetchMedicalInfo,
  updateMedicalInfoDetails,
  selectMedical,
  selectMedicalLoading,
} from '@/features/medical/medicalSlice';
import TagInput from '@/components/common/TagInput';
import Button from '@/components/common/Button';

const MedicalInfoTab = () => {
  const dispatch = useDispatch();
  const medical = useSelector(selectMedical);
  const isLoading = useSelector(selectMedicalLoading);

  const [allergies, setAllergies] = useState([]);
  const [chronicDiseases, setChronicDiseases] = useState([]);
  const [currentMedicines, setCurrentMedicines] = useState([]);
  const [medicalNotes, setMedicalNotes] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    dispatch(fetchMedicalInfo());
  }, [dispatch]);

  useEffect(() => {
    if (medical) {
      setAllergies(medical.allergies || []);
      setChronicDiseases(medical.chronicDiseases || []);
      setCurrentMedicines(medical.currentMedicines || []);
      setMedicalNotes(medical.medicalNotes || '');
      setIsDirty(false);
    }
  }, [medical]);

  const handleAllergiesChange = (newTags) => {
    setAllergies(newTags);
    setIsDirty(true);
  };

  const handleDiseasesChange = (newTags) => {
    setChronicDiseases(newTags);
    setIsDirty(true);
  };

  const handleMedicinesChange = (newTags) => {
    setCurrentMedicines(newTags);
    setIsDirty(true);
  };

  const handleNotesChange = (e) => {
    setMedicalNotes(e.target.value);
    setIsDirty(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const result = await dispatch(
      updateMedicalInfoDetails({
        allergies,
        chronicDiseases,
        currentMedicines,
        medicalNotes,
      })
    );

    if (updateMedicalInfoDetails.fulfilled.match(result)) {
      toast.success('Medical details updated successfully.');
      setIsDirty(false);
    } else {
      toast.error(result.payload?.message || 'Failed to update medical details.');
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-left">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-205 flex items-center gap-2">
          <FaHeartbeat className="text-red-500" aria-hidden="true" />
          Critical Emergency Medical Details
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          This data is vital. Responders scan your QR code to instantly read these details for fast diagnosis.
        </p>
      </div>

      {/* Safety Notice Warning Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30">
        <FaExclamationTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-xs font-bold text-red-800 dark:text-red-300">Notice to First Responders</p>
          <p className="text-xs text-red-700/90 dark:text-red-400/90 mt-1 leading-relaxed font-semibold">
            Make sure to list severe allergies (such as Penicillin or food restrictions) and active chronic treatments. Do not list generic health details to prevent clutter.
          </p>
        </div>
      </div>

      {/* Tag Inputs */}
      <div className="space-y-5">
        <TagInput
          label="Allergies"
          tags={allergies}
          onChange={handleAllergiesChange}
          placeholder="e.g. Penicillin, Peanuts, Latex"
          helperText="Type allergy name and press Enter or Comma."
        />

        <TagInput
          label="Chronic Diseases / Conditions"
          tags={chronicDiseases}
          onChange={handleDiseasesChange}
          placeholder="e.g. Asthma, Diabetes, Hypertension"
          helperText="Type illness name and press Enter or Comma."
        />

        <TagInput
          label="Current Medications"
          tags={currentMedicines}
          onChange={handleMedicinesChange}
          placeholder="e.g. Insulin, Albuterol Inhaler, Metformin"
          helperText="Type active medication name and press Enter or Comma."
        />

        {/* Textarea for medical notes */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="medicalNotes"
            className="text-xs font-semibold tracking-wide text-slate-650 dark:text-slate-400 select-none"
          >
            Responder First Aid Instructions / General Notes (Optional)
          </label>
          <textarea
            id="medicalNotes"
            rows="4"
            maxLength="500"
            value={medicalNotes}
            onChange={handleNotesChange}
            placeholder="e.g. Keep asthma inhaler in front backpack pocket. Contact spouse immediately."
            className="
              block w-full rounded-xl border text-sm font-medium p-3 outline-none transition-all duration-200
              bg-white dark:bg-slate-900/80
              text-slate-905 dark:text-slate-100
              placeholder-slate-400 dark:placeholder-slate-500
              border-slate-200 dark:border-slate-700/80
              focus:border-blue-500 dark:focus:border-blue-400
              focus:ring-2 focus:ring-blue-500/15 dark:focus:ring-blue-400/20
              hover:border-slate-300 dark:hover:border-slate-600
              resize-y
            "
          />
          <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
            <span className="flex items-center gap-1">
              <FaInfoCircle aria-hidden="true" />
              <span>Responders read this paragraph first. Keep it simple.</span>
            </span>
            <span className="font-semibold">{medicalNotes.length}/500 characters</span>
          </div>
        </div>
      </div>

      {/* Submit Trigger actions */}
      <div className="border-t border-slate-100 dark:border-slate-800/85 pt-6 flex justify-end">
        <Button
          type="submit"
          isLoading={isLoading}
          isDisabled={!isDirty}
          size="md"
        >
          Save Medical Details
        </Button>
      </div>
    </form>
  );
};

export default MedicalInfoTab;
