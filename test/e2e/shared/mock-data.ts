export const mockDoctor = {
  name: 'John Smith',
  specialty: 'Cardiology',
  bio: 'Experienced cardiologist with 15 years of practice',
};

export const mockInvalidDoctorData = {
  emptyName: {
    ...mockDoctor,
    name: '',
  },
  emptySpecialty: {
    ...mockDoctor,
    specialty: '',
  },
  longName: {
    ...mockDoctor,
    name: 'a'.repeat(256),
  },
  longSpecialty: {
    ...mockDoctor,
    specialty: 'a'.repeat(256),
  },
  longBio: {
    ...mockDoctor,
    bio: 'a'.repeat(1001),
  },
  invalidName: {
    ...mockDoctor,
    name: 'Dr. John Smith!@#',
  },
  invalidSpecialty: {
    ...mockDoctor,
    specialty: 'Cardiology!@#',
  },
  extraFields: {
    ...mockDoctor,
    extraField: 'should not be here',
  },
};
