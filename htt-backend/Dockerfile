FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-reportlab fonts-dejavu-core && rm -rf /var/lib/apt/lists/*
ENV HTT_PDF_FONT=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf
WORKDIR /source
COPY . .
RUN dotnet restore Htt.Backend.sln --locked-mode
RUN dotnet publish src/Htt.Host.Api -c Release --no-restore -o /output/api
RUN dotnet publish src/Htt.Host.Worker -c Release --no-restore -o /output/worker
RUN dotnet publish src/Htt.Host.Migrations -c Release --no-restore -o /output/migrations

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS api
WORKDIR /app
COPY --from=build /output/api .
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet","Htt.Host.Api.dll"]

FROM mcr.microsoft.com/dotnet/runtime:10.0 AS worker
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-reportlab fonts-dejavu-core && rm -rf /var/lib/apt/lists/*
ENV HTT_PDF_FONT=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf
WORKDIR /app
COPY --from=build /output/worker .
USER $APP_UID
ENTRYPOINT ["dotnet","Htt.Host.Worker.dll"]

FROM mcr.microsoft.com/dotnet/runtime:10.0 AS migrations
WORKDIR /app
COPY --from=build /output/migrations .
USER $APP_UID
ENTRYPOINT ["dotnet","Htt.Host.Migrations.dll"]
