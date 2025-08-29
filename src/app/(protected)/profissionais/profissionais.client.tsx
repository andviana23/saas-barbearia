'use client';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { listProfissionaisAction, createProfissionalAction } from './_actions';

interface Profissional {
  id: string;
  nome: string;
  unidade_id: string;
}

const UNIDADE_DEMO = '550e8400-e29b-41d4-a716-446655440000';

export default function ProfissionaisClient() {
  const [items, setItems] = useState<Profissional[]>([]);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const result = await listProfissionaisAction({ unidadeId: UNIDADE_DEMO });
      if (Array.isArray(result)) {
        // withValidationSchema retorna data diretamente no caso de sucesso
        setItems(result as Profissional[]);
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('nome', nome);
    fd.append('unidade_id', UNIDADE_DEMO);
    const result = await createProfissionalAction(fd);
    if ('success' in result && result.success) {
      setOpen(false);
      setNome('');
      await load();
    } else if ('success' in result) {
      console.error(result.error || result.errors);
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button variant="contained" onClick={() => setOpen(true)}>
          Novo Profissional
        </Button>
        {loading && <span>Carregando...</span>}
      </Stack>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>ID</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.nome}</TableCell>
              <TableCell>{p.id}</TableCell>
            </TableRow>
          ))}
          {!items.length && !loading && (
            <TableRow>
              <TableCell colSpan={2}>Nenhum profissional</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ component: 'form', onSubmit: handleCreate }}
      >
        <DialogTitle>Novo Profissional</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={!nome.trim()}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
