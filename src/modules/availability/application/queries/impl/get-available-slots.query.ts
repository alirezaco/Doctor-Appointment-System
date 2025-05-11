export class GetAvailableSlotsQuery {
  constructor(
    public readonly doctorId: string,
    public readonly date: Date,
  ) {}
}
