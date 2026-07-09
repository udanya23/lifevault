/**
 * components/common/PasswordStrengthMeter.jsx
 */

const getStrength = (pwd = '') => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[\W_]/.test(pwd)) score++;
  return score;
};

const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const colors = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
const textColors = ['', 'text-red-500', 'text-amber-500', 'text-blue-500', 'text-emerald-500'];

const PasswordStrengthMeter = ({ password }) => {
  const score = getStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? colors[score] : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-semibold ${textColors[score]}`}>{labels[score]}</p>
    </div>
  );
};

export default PasswordStrengthMeter;
