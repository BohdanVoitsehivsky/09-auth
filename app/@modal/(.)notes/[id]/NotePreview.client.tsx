'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal/Modal';
import { fetchNoteById } from '@/lib/api';
import css from './NotePreview.module.css';

type NotePreviewProps = {
  noteId: string;
};

const NotePreview = ({ noteId }: NotePreviewProps) => {
  const router = useRouter();
  const {
    data: note,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => fetchNoteById(noteId),
    refetchOnMount: false,
  });

  const handleClose = () => {
    router.back();
  };

  return (
    <Modal onClose={handleClose} contentClassName={css.modalContent}>
      <div className={css.container}>
        <button type="button" className={css.backBtn} onClick={handleClose}>
          ← Back
        </button>
        {isLoading && <p className={css.status}>Loading note…</p>}
        {(isError || !note) && !isLoading && (
          <div className={css.status}>
            <p>We couldn&apos;t load this note.</p>
            <button type="button" className={css.retryBtn} onClick={() => refetch()}>
              Try again
            </button>
          </div>
        )}
        {note && !isLoading && !isError && (
          <div className={css.item}>
            <div className={css.header}>
              <h2>{note.title}</h2>
              <span className={css.tag}>{note.tag}</span>
            </div>
            <p className={css.content}>{note.content}</p>
            <p className={css.date}>
              {new Date(note.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default NotePreview;