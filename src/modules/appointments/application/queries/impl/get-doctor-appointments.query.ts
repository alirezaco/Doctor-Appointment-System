export class GetDoctorAppointmentsQuery {
  constructor(
    public readonly doctorId: string,
    public readonly date: Date,
  ) {}
}
