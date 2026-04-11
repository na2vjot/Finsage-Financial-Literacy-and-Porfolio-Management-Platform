import React from 'react';
import { Box, Typography, Link, Divider } from '@mui/material';
import { Email, School } from '@mui/icons-material';
import { useLanguage } from '../../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: 'auto',
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Brand and Copyright */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <School sx={{ color: 'primary.main', fontSize: 24 }} />
            <Box>
              <Typography variant="h6" color="primary" gutterBottom={false}>
                🧠 FinSage
              </Typography>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} FinSage. {t('allRightsReserved')}
              </Typography>
            </Box>
          </Box>

          {/* Contact Information */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Email sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                {t('contactUs')}{' '}
                <Link href="mailto:finsage@gmail.com" color="primary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  finsage@gmail.com
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mt: 1, mb: 1 }} />

        {/* Additional Footer Content */}
        <Box
          sx={{
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t('footerTagline')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
