export class GetDoctorAvailabilityQuery {
  constructor(
    public readonly doctorId: string,
    public readonly date: string,
  ) {}
}
