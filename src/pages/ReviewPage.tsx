import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { getLesson, resolveText, type Lesson, type StrOrFn } from '../data/lessons';
import { validate } from '../utils/validator';
import { play } from '../utils/sounds';

import Editor from '../components/Editor';
import Preview from '../components/Preview';
import LessonPanel from '../components/LessonPanel';
import XPCounter from '../components/XPCounter';
import FlowBackButton from '../components/FlowBackButton';

export default function ReviewPage() {
  const { id } = useParams();
  const lesson = getLesson(id);
  const topicName = useGameStore((s) => s.topicName);

  if (!lesson || !topicName || !id) return <Navigate to="/map" replace />;
  return <ReviewScreen key={lesson.id} lesson={lesson} id={id} topicName={topicName} />;
}

function ReviewScreen({ lesson, id, topicName }: { lesson: Lesson; id: string; topicName: string }) {
  const navigate = useNavigate();
  const { mistakeLog, gainXP, setMascotMood, clearMistakeLog } = useGameStore();
  const [reviewIndex, setReviewIndex] = useState(0);
  const [code, setCode] = useState('');
  const [validationState, setValidationState] = useState<'idle' | 'pass' | 'fail'>('idle');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolve = (field?: StrOrFn) => resolveText(field, topicName);

  // Copy before sorting: Array.prototype.sort mutates, and this array belongs to the store.
  const mistakes = [...(mistakeLog[lesson.id] ?? [])]
    .sort((a, b) => b.failCount - a.failCount)
    .slice(0, 3);

  const totalReviewSteps = mistakes.length;

  const currentMistake = mistakes[reviewIndex];
  const step = lesson.steps.find(s => s.id === currentMistake?.stepId);

  useEffect(() => {
    if (step) {
      setCode(resolve(step.startingCode));
      setValidationState('idle');
      setMascotMood('idle', "Let's review this one! You struggled with it before, but you know how to do it now.");
    } else if (mistakes.length > 0 && reviewIndex >= mistakes.length) {
      navigate(`/complete/${id}`);
    }
  }, [reviewIndex, step]);

  const handleReviewPass = () => {
    gainXP(5);
    play('correct');
    setMascotMood('cheer', 'There it is! NOW it is locked in.');

    if (reviewIndex + 1 >= mistakes.length) {
      navigate(`/complete/${id}`, { replace: true });
      // Clear after navigation so the empty-mistakes guard doesn't race this redirect.
      setTimeout(() => clearMistakeLog(lesson.id), 100);
    } else {
      setReviewIndex((i) => i + 1);
      setCode('');
      setValidationState('idle');
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setValidationState('idle');
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (!step) return;
      const result = validate(step, newCode, topicName);

      if (result === 'pass') {
        setValidationState('pass');
        setTimeout(() => handleReviewPass(), 800);
      }
    }, 1000);
  };

  if (mistakes.length === 0) return <Navigate to={`/complete/${id}`} replace />;
  if (!step) return null;

  return (
    <div className="h-dvh w-full flex overflow-hidden bg-brand-bg relative">
      <FlowBackButton style={{ top: 56 }} />
      <div className="absolute top-4 right-4 z-50">
        <XPCounter />
      </div>

      {/* Review Banner */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-brand-green text-white flex items-center justify-center font-black tracking-widest uppercase z-50">
        REVIEW {Math.min(reviewIndex + 1, totalReviewSteps)} OF {totalReviewSteps} • PRACTICE MAKES PERFECT
      </div>

      {/* Panel 1 */}
      <div className="w-1/3 h-full bg-brand-greenL border-r border-brand-green/20 relative z-10 pt-16">
        <LessonPanel
          instruction={resolve(step.instruction)}
          hint={resolve(step.hint)}
          totalSteps={mistakes.length}
          // Bugfix: hide the main lesson step counter (it reads from store and can show impossible counts).
          isWarmup
        />
      </div>

      {/* Panel 2: Editor */}
      <div className="w-1/3 h-full bg-[#1A1A2E] flex flex-col relative z-20 pt-12 shadow-2xl">
        <div className="flex-1 relative overflow-hidden">
          <Editor value={code} onChange={handleCodeChange} />

          <div className={`absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 ${
            validationState === 'pass' ? 'translate-y-0 bg-brand-green text-white' :
            'translate-y-full bg-transparent'
          }`}>
            <div className="font-bold text-lg flex items-center gap-2">✓ Locked in!</div>
          </div>
        </div>
      </div>

      {/* Panel 3: Preview */}
      <div className="w-1/3 h-full bg-brand-bg p-4 flex flex-col relative z-10 pt-16">
        <div className="flex-1 rounded-xl overflow-hidden shadow-lg border-4 border-white">
          <Preview code={code} />
        </div>
      </div>
    </div>
  );
}
