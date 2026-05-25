import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export const createStation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, location, isActive } = req.body;
    const userId = req.userId!;

    const station = await prisma.station.create({
      data: {
        name,
        location,
        isActive: isActive ?? true,
        userId,
      },
    });

    res.status(201).json(station);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const stations = await prisma.station.findMany({
      where: { userId },
    });

    res.status(200).json(stations);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const station = await prisma.station.findUnique({
      where: { id },
      include: { readings: true },
    });

    if (!station) {
      res.status(404).json({ message: 'Station not found' });
      return;
    }

    if (station.userId !== userId && req.userRole !== 'ADMIN') {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    res.status(200).json(station);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllStations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const stations = await prisma.station.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(200).json(stations);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateStation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, location, isActive } = req.body;
    const userId = req.userId!;

    const station = await prisma.station.findUnique({ where: { id } });

    if (!station) {
      res.status(404).json({ message: 'Station not found' });
      return;
    }

    if (station.userId !== userId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const updatedStation = await prisma.station.update({
      where: { id },
      data: { name, location, isActive },
    });

    res.status(200).json(updatedStation);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteStation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const station = await prisma.station.findUnique({ where: { id } });

    if (!station) {
      res.status(404).json({ message: 'Station not found' });
      return;
    }

    if (station.userId !== userId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    await prisma.station.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
