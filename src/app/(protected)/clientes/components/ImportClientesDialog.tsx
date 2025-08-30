'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  IconButton,
  Alert,
  Box,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useImportarClientes } from '@/hooks/use-clientes';

interface ImportClientesDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function ImportClientesDialog({
  open,
  onClose,
  onSuccess,
}: ImportClientesDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');

  const importMutation = useImportarClientes();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0];
    if (csvFile) {
      setFile(csvFile);
      setStep('preview');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleImport = async () => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await importMutation.mutateAsync(formData);

      if (result.success) {
        setImportResult(result.data);
        setStep('result');
      } else {
        setImportResult({
          success: false,
          message: result.message,
          errors: result.errors || [],
        });
        setStep('result');
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        errors: [],
      });
      setStep('result');
    }
  };

  const handleClose = () => {
    if (!importMutation.isPending) {
      setFile(null);
      setImportResult(null);
      setStep('upload');
      onClose();
    }
  };

  const handleFinish = () => {
    const success = importResult?.success;
    const imported = importResult?.imported || 0;

    if (success && imported > 0) {
      onSuccess(`${imported} clientes importados com sucesso!`);
    }

    handleClose();
  };

  const downloadTemplate = () => {
    // Template CSV
    const template = [
      'nome,email,telefone,data_nascimento,observacoes',
      'João Silva,joao@exemplo.com,(11) 99999-9999,1990-01-15,Cliente preferencial',
      'Maria Santos,maria@exemplo.com,(11) 88888-8888,1985-05-20,Alérgica a produtos com fragrância',
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template-clientes.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderUploadStep = () => (
    <Stack spacing={3}>
      <Alert severity="info">
        <Typography variant="body2" component="div">
          <strong>Formato esperado:</strong> Arquivo CSV com as colunas:
          <code>nome, email, telefone, data_nascimento, observacoes</code>
        </Typography>
      </Alert>

      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={downloadTemplate}
        sx={{ alignSelf: 'flex-start' }}
      >
        Baixar Template
      </Button>

      <Paper
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.default',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />

        <Typography variant="h6" gutterBottom>
          {isDragActive
            ? 'Solte o arquivo aqui'
            : 'Arraste o arquivo CSV aqui ou clique para selecionar'}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Máximo 5MB • Apenas arquivos .csv
        </Typography>
      </Paper>
    </Stack>
  );

  const renderPreviewStep = () => (
    <Stack spacing={3}>
      <Alert severity="info">
        Arquivo selecionado. Clique em &quot;Importar&quot; para processar os dados.
      </Alert>

      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom>
          Arquivo selecionado:
        </Typography>
        <Typography variant="body1">ðŸ“„ {file?.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {file ? `${(file.size / 1024).toFixed(1)} KB` : ''}
        </Typography>
      </Paper>

      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          onClick={() => {
            setFile(null);
            setStep('upload');
          }}
        >
          Escolher Outro
        </Button>
      </Stack>
    </Stack>
  );

  const renderResultStep = () => {
    const success = importResult?.success;
    const imported = importResult?.imported || 0;
    const errors = importResult?.errors || [];
    const skipped = importResult?.skipped || 0;

    return (
      <Stack spacing={3}>
        <Alert severity={success ? 'success' : 'error'}>
          {success
            ? `Importação concluída! ${imported} clientes importados.`
            : `Erro na importação: ${importResult?.message}`}
        </Alert>

        {success && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Resumo da Importação
            </Typography>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary={`${imported} clientes importados`}
                  secondary="Adicionados com sucesso ao sistema"
                />
              </ListItem>

              {skipped > 0 && (
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${skipped} clientes ignorados`}
                    secondary="Já existiam no sistema ou dados incompletos"
                  />
                </ListItem>
              )}
            </List>
          </Box>
        )}

        {errors.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom color="error">
              Erros Encontrados
            </Typography>

            <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
              {errors.slice(0, 10).map((error: any, index: number) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <ErrorIcon color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Linha ${error.line || index + 1}`}
                    secondary={error.message}
                  />
                </ListItem>
              ))}

              {errors.length > 10 && (
                <ListItem>
                  <ListItemText secondary={`... e mais ${errors.length - 10} erros`} />
                </ListItem>
              )}
            </List>
          </Box>
        )}
      </Stack>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Importar Clientes</Typography>
          <IconButton onClick={handleClose} disabled={importMutation.isPending} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {importMutation.isPending && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1 }} textAlign="center">
              Processando arquivo...
            </Typography>
          </Box>
        )}

        {step === 'upload' && renderUploadStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'result' && renderResultStep()}
      </DialogContent>

      <DialogActions>
        {step === 'upload' && <Button onClick={handleClose}>Cancelar</Button>}

        {step === 'preview' && (
          <>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleImport}
              disabled={!file || importMutation.isPending}
            >
              Importar
            </Button>
          </>
        )}

        {step === 'result' && (
          <Button variant="contained" onClick={handleFinish}>
            Concluir
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
